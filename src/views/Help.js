/**
 * Renders the Help / How-To view.
 * 
 * @param {HTMLElement} container - The DOM element to render content into.
 */
export function renderHelp(container) {
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '800px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '20px';
    wrapper.style.color = 'var(--text-color)';

    const h1 = document.createElement('h1');
    h1.textContent = 'How to Use effDRY';
    h1.style.marginBottom = '20px';
    h1.style.borderBottom = '1px solid var(--border-color)';
    wrapper.appendChild(h1);

    const sections = [
        {
            title: '1. Basic Variables',
            content: `
                <p>Use curly braces to define variables. They will appear as input fields in the Generator.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    Hello {customer_name}, thanks for your order!
                </code>
            `
        },
        {
            title: '2. Defaults',
            content: `
                <p>You can define a default value by adding a colon inside the braces.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    Hi {user:Guest}, welcome back!
                </code>
                <p>If you leave the input empty in the Generator, "Guest" will be used.</p>
            `
        },
        {
            title: '3. Logic & Conditionals',
            content: `
                <p>Show or hide content based on a checkbox (Switch). Use <code>{#if var}...{/if}</code>.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    {#if is_vip}
                    Exclusive VIP Offer: 20% OFF!
                    {/if}
                </code>
                <p>In the Generator, "is_vip" will appear as a <b>checkbox</b>.</p>
            `
        },
        {
            title: '4. Template Groups (Folders)',
            content: `
                <p>Organize your templates into groups.</p>
                <ul>
                    <li><b>Create Group</b>: Use the "+ Group" form at the top of the Editor list.</li>
                    <li><b>Move Templates</b>: Drag and drop templates into group boxes.</li>
                    <li><b>Delete Group</b>: Deleting a group moves its templates to the "Ungrouped" section.</li>
                </ul>
            `
        },
        {
            title: '5. Rich Text Mode',
            content: `
                <p>Toggle "Rich Text" on any template to use bold, italics, headers, lists, etc.</p>
            `
        }
    ];

    sections.forEach(sec => {
        const div = document.createElement('div');
        div.style.marginBottom = '40px';

        const h2 = document.createElement('h2');
        h2.textContent = sec.title;
        h2.style.fontSize = '1.2rem';
        h2.style.marginBottom = '10px';
        h2.style.color = 'var(--accent-color)';

        const body = document.createElement('div');
        body.innerHTML = sec.content;
        body.style.lineHeight = '1.6';

        div.append(h2, body);
        wrapper.appendChild(div);
    });

    container.appendChild(wrapper);
}
