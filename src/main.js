import './style.css'
import { store } from './store.js'
import { renderEditor } from './views/Editor.js'
import { renderGenerator } from './views/Generator.js'
import { renderImpressum, renderPrivacy } from './views/Legal.js'

const app = document.querySelector('#app')

// Global State for UI
let currentMode = 'editor';
let selectedTopicId = null;

// Initial Logic
if (store.state.topics.length > 0) {
  selectedTopicId = store.state.topics[0].id;
  currentMode = 'generator'; // Default to generator if topics exist
} else {
  // No topics? Default to editor.
  // We can also auto-trigger a new topic for them to start editing immediately.
  const id = store.addTopic('New Topic');
  selectedTopicId = id;
  currentMode = 'editor';
}

function render() {
  app.innerHTML = '';

  // App Shell Structure
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  // --- SIDEBAR ---
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  const sbHeader = document.createElement('div');
  sbHeader.className = 'sidebar-header';
  sbHeader.innerHTML = '<span>TOPICS</span>';

  const addBtn = document.createElement('button');
  addBtn.className = 'icon-btn';
  addBtn.textContent = '+';
  addBtn.title = 'New Topic';
  addBtn.onclick = () => {
    const id = store.addTopic('New Topic');
    selectedTopicId = id;
    currentMode = 'editor'; // Switch to editor to see the new topic
    render();
  };
  sbHeader.appendChild(addBtn);
  sidebar.appendChild(sbHeader);

  const sbContent = document.createElement('div');
  sbContent.className = 'sidebar-content';

  store.state.topics.forEach(topic => {
    const item = document.createElement('div');
    item.className = `sidebar-item ${topic.id === selectedTopicId && ['editor', 'generator'].includes(currentMode) ? 'active' : ''}`;
    item.textContent = topic.name;
    item.onclick = () => {
      selectedTopicId = topic.id;
      // Preserve mode if switching between topics, otherwise default to editor
      if (!['editor', 'generator'].includes(currentMode)) {
        currentMode = 'editor';
      }
      render();
    };
    sbContent.appendChild(item);
  });

  sidebar.appendChild(sbContent);

  // Data Section
  const sbData = document.createElement('div');
  sbData.className = 'sidebar-legal'; // Reuse styling
  sbData.style.borderTop = '1px solid var(--border-color)';

  const dataHeader = document.createElement('div');
  dataHeader.className = 'sidebar-header';
  dataHeader.style.borderBottom = 'none';
  dataHeader.innerHTML = '<span>DATEN</span>';
  sbData.appendChild(dataHeader);

  // EXPORT
  const exportItem = document.createElement('div');
  exportItem.className = 'sidebar-item';
  exportItem.textContent = 'Export JSON';
  exportItem.onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "effdry_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  sbData.appendChild(exportItem);

  // IMPORT
  const importItem = document.createElement('div');
  importItem.className = 'sidebar-item';
  importItem.textContent = 'Import JSON';
  importItem.onclick = () => {
    // Create hidden file input
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
            // Reset state
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

  // Legal Section in Sidebar (Bottom)
  const sbLegal = document.createElement('div');
  sbLegal.className = 'sidebar-legal';
  sbLegal.style.borderTop = '1px solid var(--border-color)';

  const legalHeader = document.createElement('div');
  legalHeader.className = 'sidebar-header';
  legalHeader.style.borderBottom = 'none'; // Remove border as container has top border
  legalHeader.innerHTML = '<span>RECHTLICHES</span>';
  sbLegal.appendChild(legalHeader);

  const impressumItem = document.createElement('div');
  impressumItem.className = `sidebar-item ${currentMode === 'impressum' ? 'active' : ''}`;
  impressumItem.textContent = 'Impressum';
  impressumItem.onclick = () => {
    currentMode = 'impressum';
    selectedTopicId = null; // Deselect topic
    render();
  };
  sbLegal.appendChild(impressumItem);

  const privacyItem = document.createElement('div');
  privacyItem.className = `sidebar-item ${currentMode === 'privacy' ? 'active' : ''}`;
  privacyItem.textContent = 'Datenschutz';
  privacyItem.onclick = () => {
    currentMode = 'privacy';
    selectedTopicId = null; // Deselect topic
    render();
  };
  sbLegal.appendChild(privacyItem);

  sidebar.appendChild(sbLegal);
  shell.appendChild(sidebar);

  // --- MAIN COLUMN ---
  const mainCol = document.createElement('div');
  mainCol.className = 'main-column';

  // Top Menu
  const topMenu = document.createElement('header');
  topMenu.className = 'top-menu';

  // Left side of Top Menu: Current Topic Name
  const topicTitle = document.createElement('div');
  topicTitle.style.fontWeight = 'bold';

  const currentTopic = store.state.topics.find(t => t.id === selectedTopicId);

  let titleText = '';
  if (currentMode === 'impressum') titleText = 'Impressum';
  else if (currentMode === 'privacy') titleText = 'Datenschutzerklärung';
  else {
    titleText = currentTopic ? currentTopic.name : 'No Topic Selected';
  }

  topicTitle.textContent = titleText;
  topMenu.appendChild(topicTitle);

  // Right side: Mode Switcher
  const modeSwitcher = document.createElement('div');
  modeSwitcher.className = 'mode-switcher';

  if (['editor', 'generator'].includes(currentMode)) {
    const btnEdit = document.createElement('button');
    btnEdit.className = `mode-btn ${currentMode === 'editor' ? 'active' : ''}`;
    btnEdit.textContent = 'Editor';
    btnEdit.onclick = () => { currentMode = 'editor'; render(); };

    const btnGen = document.createElement('button');
    btnGen.className = `mode-btn ${currentMode === 'generator' ? 'active' : ''}`;
    btnGen.textContent = 'Generator';
    btnGen.onclick = () => { currentMode = 'generator'; render(); };

    modeSwitcher.append(btnEdit, btnGen);
  }
  topMenu.appendChild(modeSwitcher);
  mainCol.appendChild(topMenu);

  // Content Area
  const contentArea = document.createElement('main');
  contentArea.className = 'content-area';

  if (currentMode === 'impressum') {
    renderImpressum(contentArea);
  } else if (currentMode === 'privacy') {
    renderPrivacy(contentArea);
  } else if (currentTopic) {
    if (currentMode === 'editor') {
      renderEditor(contentArea, currentTopic);
    } else {
      renderGenerator(contentArea, currentTopic);
    }
  } else {
    contentArea.innerHTML = '<div style="opacity:0.5; text-align:center; padding-top:50px;">Create a topic to get started.</div>';
  }

  mainCol.appendChild(contentArea);
  shell.appendChild(mainCol);
  app.appendChild(shell);
}

// Initial Render
render();

// Subscribe to store changes to keep Sidebar and Title in sync
store.subscribe(() => {
  // Check if selected topic still exists
  const exists = store.state.topics.find(t => t.id === selectedTopicId);
  if (!exists) {
    selectedTopicId = store.state.topics.length > 0 ? store.state.topics[0].id : null;
  }
  render();
});
