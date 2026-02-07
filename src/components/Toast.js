/**
 * Simple Toast Notification System
 * Appends a toast message to the bottom right of the screen.
 * Supports an optional "Undo" action.
 */

const TOAST_CONTAINER_ID = 'effdry-toast-container';

// Initialize container
function getContainer() {
    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = TOAST_CONTAINER_ID;
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a toast notification.
 * @param {string} message - Message to display.
 * @param {Function} [onUndo] - Optional callback for Undo action.
 * @param {number} [duration=5000] - Duration in ms before auto-dismissing.
 */
export function showToast(message, onUndo = null, duration = 5000) {
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.background = 'var(--input-bg)';
    toast.style.color = 'var(--text-color)';
    toast.style.border = '1px solid var(--accent-color)';
    toast.style.borderRadius = '4px';
    toast.style.padding = '10px 15px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '15px';
    toast.style.minWidth = '250px';
    toast.style.animation = 'slideIn 0.3s ease-out';

    // Message
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    msgSpan.style.flex = '1';
    toast.appendChild(msgSpan);

    // Undo Button
    if (onUndo) {
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'UNDO';
        undoBtn.style.background = 'transparent';
        undoBtn.style.color = 'var(--accent-color)';
        undoBtn.style.fontWeight = 'bold';
        undoBtn.style.padding = '2px 8px';
        undoBtn.style.fontSize = '0.85rem';
        undoBtn.onclick = () => {
            onUndo();
            removeToast();
        };
        toast.appendChild(undoBtn);
    }

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'icon-btn';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.lineHeight = '0.8';
    closeBtn.style.padding = '0 4px';
    closeBtn.onclick = removeToast;
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    let timer = setTimeout(removeToast, duration);

    function removeToast() {
        if (timer) clearTimeout(timer);
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }
}

// Add strict animation styles if not present
if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
