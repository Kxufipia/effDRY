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

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(l => l(this.state));
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  },

  // Actions
  addTopic(name) {
    const id = crypto.randomUUID();
    this.state.topics.push({ id, name, templates: [], keywordMappings: {} });
    this.save();
    return id;
  },

  updateTopic(id, name) {
    const topic = this.state.topics.find(t => t.id === id);
    if (topic) {
      topic.name = name;
      this.save();
    }
  },

  updateKeywordMapping(topicId, keyword, label) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      if (!topic.keywordMappings) topic.keywordMappings = {};
      topic.keywordMappings[keyword] = label;
      this.save();
    }
  },

  deleteTopic(id) {
    this.state.topics = this.state.topics.filter(t => t.id !== id);
    this.save();
  },

  addTemplate(topicId, content) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      const id = crypto.randomUUID();
      topic.templates.push({ id, content });
      this.save();
      return id;
    }
  },

  updateTemplate(topicId, templateId, updates) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      const template = topic.templates.find(t => t.id === templateId);
      if (template) {
        if (typeof updates === 'string') {
          template.content = updates; // Backward compatibility
        } else {
          Object.assign(template, updates);
        }
        this.save();
      }
    }
  },

  deleteTemplate(topicId, templateId) {
    const topic = this.state.topics.find(t => t.id === topicId);
    if (topic) {
      topic.templates = topic.templates.filter(t => t.id !== templateId);
      this.save();
    }
  },

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
