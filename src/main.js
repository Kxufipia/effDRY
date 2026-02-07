import './style.css'
import { store } from './store.js'
import { renderEditor } from './views/Editor.js'
import { renderGenerator } from './views/Generator.js'
import { renderImpressum, renderPrivacy } from './views/Legal.js'
import { renderHelp } from './views/Help.js'
import { t, setLanguage, getLanguage, subscribeLanguage } from './i18n.js'

const app = document.querySelector('#app')

// =========================================
// Global UI State
// =========================================
let currentMode = 'editor'; // 'editor', 'generator', 'impressum', 'privacy', 'help'
let selectedTopicId = null;
let currentTheme = localStorage.getItem('effdry_theme') || 'dark';

// Verify and apply theme on load
if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}

// =========================================
// Initialization Logic
// =========================================
if (store.state.topics.length > 0) {
  selectedTopicId = store.state.topics[0].id;
  currentMode = 'generator'; // Default to generator if topics exist
} else {
  // If no topics exist, create a default one to start fresh
  const id = store.addTopic('New Topic');
  selectedTopicId = id;
  currentMode = 'editor';
}

/**
 * Main Render Function
 * Rebuilds the entire application DOM based on current state.
 */
function render() {
  app.innerHTML = '';

  // App Shell Container
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  // -----------------------------------------
  // Left Sidebar
  // -----------------------------------------
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // Sidebar Header (Topics)
  const sbHeader = document.createElement('div');
  sbHeader.className = 'sidebar-header';
  sbHeader.innerHTML = `<span>${t('sidebar.topics')}</span>`;
  sbHeader.style.flexWrap = 'wrap';

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '5px';

  const addFolderBtn = document.createElement('button');
  addFolderBtn.className = 'icon-btn';
  addFolderBtn.textContent = '📁+';
  addFolderBtn.title = t('sidebar.newFolder');
  addFolderBtn.style.fontSize = '0.8rem';
  addFolderBtn.onclick = () => {
    const name = prompt(`${t('sidebar.newFolder')}:`);
    if (name) store.addTopicFolder(name);
    render();
  };

  const addBtn = document.createElement('button');
  addBtn.className = 'icon-btn';
  addBtn.textContent = '+';
  addBtn.title = t('sidebar.newTopic');
  addBtn.onclick = () => {
    const id = store.addTopic(t('sidebar.newTopic'));
    selectedTopicId = id;
    currentMode = 'editor';
    render();
  };

  actions.append(addFolderBtn, addBtn);
  sbHeader.appendChild(actions);
  sidebar.appendChild(sbHeader);

  // Sidebar Content (Topic List)
  const sbContent = document.createElement('div');
  sbContent.className = 'sidebar-content';

  // --- Drag and Drop State ---
  let draggedTopicId = null;

  // 1. Render Folders
  const folders = store.state.topicFolders || [];
  folders.forEach(folder => {
    const folderItem = document.createElement('div');
    folderItem.className = 'sidebar-folder';

    // Drop Zone for Folder
    folderItem.ondragover = (e) => {
      e.preventDefault();
      folderItem.style.background = 'var(--accent-color)';
    };
    folderItem.ondragleave = (e) => {
      folderItem.style.background = '';
    };
    folderItem.ondrop = (e) => {
      e.preventDefault();
      folderItem.style.background = '';
      if (draggedTopicId) {
        store.moveTopic(draggedTopicId, folder.id);
        draggedTopicId = null;
        render();
      }
    };

    const folderHeader = document.createElement('div');
    folderHeader.className = 'sidebar-item folder-header';
    folderHeader.style.fontWeight = 'bold';
    folderHeader.style.display = 'flex';
    folderHeader.style.justifyContent = 'space-between';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = (folder.isCollapsed ? '▶ ' : '▼ ') + folder.name;
    titleSpan.onclick = () => {
      store.updateTopicFolder(folder.id, { isCollapsed: !folder.isCollapsed });
      render();
    };

    const delFolderBtn = document.createElement('button');
    delFolderBtn.textContent = 'x';
    delFolderBtn.className = 'icon-btn';
    delFolderBtn.style.fontSize = '0.7rem';
    delFolderBtn.style.opacity = '0.5';
    delFolderBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm(t('sidebar.confirmDeleteFolder'))) {
        store.deleteTopicFolder(folder.id);
        render();
      }
    };

    folderHeader.append(titleSpan, delFolderBtn);
    folderItem.appendChild(folderHeader);

    if (!folder.isCollapsed) {
      const folderTopics = store.state.topics.filter(t => t.folderId === folder.id);
      folderTopics.forEach(topic => {
        const item = createTopicItem(topic);
        item.style.paddingLeft = '25px'; // Indent
        folderItem.appendChild(item);
      });

      if (folderTopics.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = '(empty)';
        empty.style.paddingLeft = '25px';
        empty.style.fontSize = '0.7rem';
        empty.style.opacity = '0.5';
        folderItem.appendChild(empty);
      }
    }

    sbContent.appendChild(folderItem);
  });

  // 2. Render Root Topics (No Folder)
  const rootTopics = store.state.topics.filter(t => !t.folderId);
  if (rootTopics.length > 0) {
    if (folders.length > 0) {
      const div = document.createElement('div');
      div.style.borderTop = '1px solid var(--border-color)';
      div.style.margin = '5px 0';
      sbContent.appendChild(div);
    }
    rootTopics.forEach(topic => {
      sbContent.appendChild(createTopicItem(topic));
    });
  }

  // Drop Zone for Root (moving out of folders)
  sbContent.ondragover = (e) => {
    // Only if hovering over empty space or root area
    if (e.target === sbContent) {
      e.preventDefault();
      sbContent.style.background = 'rgba(255,255,255,0.05)';
    }
  };
  sbContent.ondragleave = (e) => {
    sbContent.style.background = '';
  };
  sbContent.ondrop = (e) => {
    if (e.target === sbContent) {
      e.preventDefault();
      sbContent.style.background = '';
      if (draggedTopicId) {
        store.moveTopic(draggedTopicId, null); // Move to root
        draggedTopicId = null;
        render();
      }
    }
  };

  /**
   * Helper to create a draggable topic item
   */
  function createTopicItem(topic) {
    const item = document.createElement('div');
    item.className = `sidebar-item ${topic.id === selectedTopicId && ['editor', 'generator'].includes(currentMode) ? 'active' : ''}`;
    item.textContent = topic.name;
    item.draggable = true;

    item.ondragstart = (e) => {
      draggedTopicId = topic.id;
      e.dataTransfer.effectAllowed = 'move';
      item.style.opacity = '0.5';
    };

    item.ondragend = () => {
      item.style.opacity = '1';
      draggedTopicId = null;
    };

    item.onclick = () => {
      selectedTopicId = topic.id;
      if (!['editor', 'generator'].includes(currentMode)) {
        currentMode = 'editor';
      }
      render();
    };
    return item;
  }

  sidebar.appendChild(sbContent);

  // -----------------------------------------
  // Sidebar Footer (Data & Legal)
  // -----------------------------------------

  // Data Management Section
  const sbData = document.createElement('div');
  sbData.className = 'sidebar-legal';
  sbData.style.borderTop = '1px solid var(--border-color)';

  const dataHeader = document.createElement('div');
  dataHeader.className = 'sidebar-header';
  dataHeader.style.borderBottom = 'none';
  dataHeader.innerHTML = `<span>${t('sidebar.data')}</span>`;
  sbData.appendChild(dataHeader);

  // Export Button
  const exportItem = document.createElement('div');
  exportItem.className = 'sidebar-item';
  exportItem.textContent = t('sidebar.export');
  exportItem.onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "effdry_data.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  sbData.appendChild(exportItem);

  // Import Button
  const importItem = document.createElement('div');
  importItem.className = 'sidebar-item';
  importItem.textContent = t('sidebar.import');
  importItem.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (store.importData(data)) {
            alert('Import successful!');
            // Reset selection to first available topic
            selectedTopicId = store.state.topics.length > 0 ? store.state.topics[0].id : null;
            currentMode = 'editor';
            render();
          } else {
            alert('Invalid data format.');
          }
        } catch (err) {
          console.error(err);
          alert('Error parsing JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  sbData.appendChild(importItem);
  sidebar.appendChild(sbData);

  // SUPPORT Section
  const sbSupport = document.createElement('div');
  sbSupport.className = 'sidebar-legal';
  sbSupport.style.borderTop = '1px solid var(--border-color)';

  const supportHeader = document.createElement('div');
  supportHeader.className = 'sidebar-header';
  supportHeader.style.borderBottom = 'none';
  supportHeader.innerHTML = `<span>${t('sidebar.support')}</span>`;
  sbSupport.appendChild(supportHeader);

  const helpItem = document.createElement('div');
  helpItem.className = `sidebar-item ${currentMode === 'help' ? 'active' : ''}`;
  helpItem.textContent = t('sidebar.help');
  helpItem.onclick = () => {
    currentMode = 'help';
    selectedTopicId = null;
    render();
  };
  sbSupport.appendChild(helpItem);
  sidebar.appendChild(sbSupport);

  // Legal Links Section
  const sbLegal = document.createElement('div');
  sbLegal.className = 'sidebar-legal';
  sbLegal.style.borderTop = '1px solid var(--border-color)';

  const legalHeader = document.createElement('div');
  legalHeader.className = 'sidebar-header';
  legalHeader.style.borderBottom = 'none';
  legalHeader.innerHTML = `<span>${t('sidebar.legal')}</span>`;
  sbLegal.appendChild(legalHeader);

  const impressumItem = document.createElement('div');
  impressumItem.className = `sidebar-item ${currentMode === 'impressum' ? 'active' : ''}`;
  impressumItem.textContent = t('sidebar.impressum');
  impressumItem.onclick = () => {
    currentMode = 'impressum';
    selectedTopicId = null;
    render();
  };
  sbLegal.appendChild(impressumItem);

  const privacyItem = document.createElement('div');
  privacyItem.className = `sidebar-item ${currentMode === 'privacy' ? 'active' : ''}`;
  privacyItem.textContent = t('sidebar.privacy');
  privacyItem.onclick = () => {
    currentMode = 'privacy';
    selectedTopicId = null;
    render();
  };
  sbLegal.appendChild(privacyItem);
  sbLegal.appendChild(privacyItem);

  sidebar.appendChild(sbLegal);
  shell.appendChild(sidebar);

  // -----------------------------------------
  // Main Content Column
  // -----------------------------------------
  const mainCol = document.createElement('div');
  mainCol.className = 'main-column';

  // Top Navigation Bar
  const topMenu = document.createElement('header');
  topMenu.className = 'top-menu';

  // Title Area
  const topicTitle = document.createElement('div');
  topicTitle.style.fontWeight = 'bold';

  const currentTopic = store.state.topics.find(t => t.id === selectedTopicId);
  let titleText = '';
  if (currentMode === 'impressum') titleText = t('sidebar.impressum');
  else if (currentMode === 'privacy') titleText = t('sidebar.privacy');
  else if (currentMode === 'help') titleText = t('help.title');
  else {
    titleText = currentTopic ? currentTopic.name : t('header.noTopic');
  }
  topicTitle.textContent = titleText;
  topMenu.appendChild(topicTitle);

  // Right Side Controls (Theme + Mode Switcher)
  const rightControls = document.createElement('div');
  rightControls.className = 'flex-row';
  rightControls.style.gap = '15px';

  // Theme Toggle
  const themeBtn = document.createElement('button');
  themeBtn.className = 'icon-btn';
  themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  themeBtn.title = 'Toggle Theme';
  themeBtn.onclick = () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('effdry_theme', currentTheme);
    render(); // Re-render to update button icon
  };

  // Language Toggle
  const langBtn = document.createElement('button');
  langBtn.className = 'icon-btn';
  langBtn.textContent = getLanguage().toUpperCase();
  langBtn.title = 'Switch Language (EN/DE)';
  langBtn.style.fontSize = '0.8rem';
  langBtn.onclick = () => {
    const next = getLanguage() === 'en' ? 'de' : 'en';
    setLanguage(next);
  };

  rightControls.append(langBtn, themeBtn);

  // Mode Switcher (Editor vs Generator)
  const modeSwitcher = document.createElement('div');
  modeSwitcher.className = 'mode-switcher';

  if (['editor', 'generator'].includes(currentMode)) {
    const btnEdit = document.createElement('button');
    btnEdit.className = `mode-btn ${currentMode === 'editor' ? 'active' : ''}`;
    btnEdit.textContent = t('header.editor');
    btnEdit.onclick = () => { currentMode = 'editor'; render(); };

    const btnGen = document.createElement('button');
    btnGen.className = `mode-btn ${currentMode === 'generator' ? 'active' : ''}`;
    btnGen.textContent = t('header.generator');
    btnGen.onclick = () => { currentMode = 'generator'; render(); };

    modeSwitcher.append(btnEdit, btnGen);
  }
  rightControls.appendChild(modeSwitcher);
  topMenu.appendChild(rightControls);

  mainCol.appendChild(topMenu);

  // View Content Area
  const contentArea = document.createElement('main');
  contentArea.className = 'content-area';

  if (currentMode === 'impressum') {
    renderImpressum(contentArea);
  } else if (currentMode === 'privacy') {
    renderPrivacy(contentArea);
  } else if (currentMode === 'help') {
    renderHelp(contentArea);
  } else if (currentTopic) {
    if (currentMode === 'editor') {
      renderEditor(contentArea, currentTopic);
    } else {
      renderGenerator(contentArea, currentTopic);
    }
  } else {
    // Empty State
    contentArea.innerHTML = '<div style="opacity:0.5; text-align:center; padding-top:50px;">Create a topic to get started.</div>';
  }

  mainCol.appendChild(contentArea);
  shell.appendChild(mainCol);
  app.appendChild(shell);
}

// =========================================
// App Bootstrap
// =========================================
console.log('effDRY App v1.1.0 - Low Hanging Fruit Features');
try {
  render();
} catch (e) {
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h3>Application Error</h3><pre>${e.stack}</pre><button onclick="localStorage.removeItem('effdry_lang');location.reload()">Reset Language</button></div>`;
  console.error(e);
}

// Subscribe to store updates to keep UI in sync
store.subscribe(() => {
  // Ensure selectedTopicId remains valid after deletions
  const exists = store.state.topics.find(t => t.id === selectedTopicId);
  if (!exists) {
    selectedTopicId = store.state.topics.length > 0 ? store.state.topics[0].id : null;
  }
  render();
});

// Re-render on language change
subscribeLanguage(() => {
  render();
});
