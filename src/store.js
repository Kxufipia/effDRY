const STORAGE_KEY = 'effdry_data_v2'; // Bump version to force new defaults

const defaultData = {
  topics: [
    {
      id: 'demo_topic',
      name: 'Demo: Customer Responses',
      templates: [
        {
          id: 't1',
          content: 'Hello {customer_name},\n\nThank you for contacting support regarding "{issue}".\nWe have opened ticket #{ticket_id} for you.\n\nBest regards,\n{support_agent}',
          isRichText: false
        },
        {
          id: 't2',
          content: '<h1>Monthly Report: {month}</h1><p><b>Total Sales:</b> ${sales_amount}</p><p><b>Top Performer:</b> {employee_name}</p><ul><li>Goal Reached: {goal_status}</li></ul>',
          isRichText: true
        },
        {
          id: 't3',
          content: 'const {variable_name} = await fetch("{api_endpoint}");\nconsole.log({variable_name});',
          isRichText: false
        }
      ]
    }
  ]
};

export const store = {
  state: JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData,

  listeners: [],

  /**
   * Subscribe to state changes.
   * @param {Function} listener - Callback function to invoke on state change.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  /**
   * Notify all listeners of the current state.
   */
  notify() {
    this.listeners.forEach(l => l(this.state));
  },

  /**
   * Save the current state to localStorage and optionally notify listeners.
   * @param {boolean} [notify=true] - Whether to trigger listeners after saving.
   */
  save(notify = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    if (notify) {
      this.notify();
    }
  },

  // =========================================
  // Topic Actions
  // =========================================

  /**
   * Add a new topic.
   * @param {string} name - Name of the topic.
   * @returns {string} The ID of the newly created topic.
   */
  addTopic(name) {
    const id = crypto.randomUUID();
    this.state.topics.push({ id, name, groups: [], templates: [], keywordMappings: {}, keywordOrder: [] });
    this.save();
    return id;
  },

  /**
   * Update an existing topic's name.
   * @param {string} id - Topic ID.
   * @param {string} name - New name.
   */
  updateTopic(id, name) {
    const topic = this.state.topics.find(t => t.id === id);
    if (topic) {
      topic.name = name;
      this.save();
    }
  },

  /**
   * Update the display label for a specific keyword in a topic.
   * @param {string} topicId - Topic ID.
   * @param {string} keyword - The keyword to map (e.g., "customer_name").
   * @param {string} label - The display label (e.g., "Customer Name").
   */
  updateKeywordMapping(topicId, keyword, label) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      if (!topic.keywordMappings) topic.keywordMappings = {};
      topic.keywordMappings[keyword] = label;
      this.save();
    }
  },

  /**
   * Update the sort order of keywords for a topic.
   * @param {string} topicId - Topic ID.
   * @param {string[]} newOrder - Array of keywords in desired order.
   */
  updateKeywordOrder(topicId, newOrder) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      topic.keywordOrder = newOrder;
      this.save();
    }
  },

  /**
   * Delete a topic by ID.
   * @param {string} id - Topic ID.
   */
  deleteTopic(id) {
    this.state.topics = this.state.topics.filter(t => t.id !== id);
    this.save();
  },

  /**
   * Restore a deleted topic.
   * @param {Object} topic - The topic object to restore.
   */
  restoreTopic(topic) {
    this.state.topics.push(topic);
    this.save();
  },

  // =========================================
  // Group Actions
  // =========================================

  /**
   * Add a new group to a topic.
   * @param {string} topicId 
   * @param {string} name 
   */
  addGroup(topicId, name) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      if (!topic.groups) topic.groups = [];
      const id = crypto.randomUUID();
      topic.groups.push({ id, name });
      this.save();
      return id;
    }
  },

  /**
   * Update a group's name.
   * @param {string} topicId 
   * @param {string} groupId 
   * @param {string} name 
   */
  updateGroup(topicId, groupId, name) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic && topic.groups) {
      const group = topic.groups.find(g => g.id === groupId);
      if (group) {
        group.name = name;
        this.save();
      }
    }
  },

  /**
   * Delete a group. Moves templates to ungrouped (null).
   * @param {string} topicId 
   * @param {string} groupId 
   */
  deleteGroup(topicId, groupId) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic && topic.groups) {
      // Remove group
      topic.groups = topic.groups.filter(g => g.id !== groupId);
      // Move templates to root
      topic.templates.forEach(t => {
        if (t.groupId === groupId) {
          t.groupId = null;
        }
      });
      this.save();
    }
  },

  /**
   * Move a template to a specific group (or root).
   * @param {string} topicId 
   * @param {string} templateId 
   * @param {string|null} groupId 
   */
  moveTemplate(topicId, templateId, groupId) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      const tpl = topic.templates.find(t => t.id === templateId);
      if (tpl) {
        tpl.groupId = groupId;
        this.save();
      }
    }
  },

  // =========================================
  // Template Actions
  // =========================================

  /**
   * Add a new template to a topic.
   * @param {string} topicId - Topic ID.
   * @param {string} content - Template content.
   * @param {string} [forceId] - Optional ID to force (for restore/undo).
   * @returns {string|undefined} The ID of the new template, or undefined if topic not found.
   */
  addTemplate(topicId, content, forceId = null, groupId = null) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      const id = forceId || crypto.randomUUID();
      topic.templates.push({ id, content, groupId });
      this.save();
      return id;
    }
  },

  /**
   * Restore a deleted template.
   * @param {string} topicId - Topic ID.
   * @param {Object} template - The template object to restore.
   */
  restoreTemplate(topicId, template) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      topic.templates.push(template);
      this.save();
    }
  },

  /**
   * Update a template's properties.
   * @param {string} topicId - Topic ID.
   * @param {string} templateId - Template ID.
   * @param {Object} updates - Object containing properties to update (content, isRichText).
   * @param {boolean} [notify=true] - Whether to trigger a re-render. Set to false for high-frequency updates (e.g., tying).
   */
  updateTemplate(topicId, templateId, updates, notify = true) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      const tpl = topic.templates.find(t => t.id === templateId);
      if (tpl) {
        Object.assign(tpl, updates);
        this.save(notify);
      }
    }
  },

  /**
   * Delete a template.
   * @param {string} topicId - Topic ID.
   * @param {string} templateId - Template ID.
   */
  deleteTemplate(topicId, templateId) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      topic.templates = topic.templates.filter(t => t.id !== templateId);
      this.save();
    }
  },

  // =========================================
  // Import/Export
  // =========================================

  /**
   * Import data into the store.
   * @param {Object} data - The data object to import.
   * @returns {boolean} True if import was successful, false otherwise.
   */
  importData(data) {
    // Basic validation
    if (data && Array.isArray(data.topics)) {
      this.state = data;
      this.save();
      return true;
    }
    return false;
  }
};
