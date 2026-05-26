// Globals

let current_mailbox = '';

document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');

    // Submit trigger
    document.querySelector('#compose-form').addEventListener('submit', send_mail);
});

function compose_email() {

    // Show compose view and hide other views
    clear();
    show_view('#compose-view');
}

function load_mailbox(mailbox) {

    current_mailbox = mailbox;

    // Show the mailbox and hide other views
    show_view('#emails-view');

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Get mails
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        render_emails(emails);
    })
}

function send_mail(event) {

    event.preventDefault();

    // Collect data
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send mail
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        if ("error" in result) {
            feedback_message('#compose-view', result.error);
        } else {
            clear();
            load_mailbox('sent');
            feedback_message('#emails-view', result.message);
        }
    })
}

function render_emails(emails) {

    clear();

    const email_list_group = document.querySelector('#emails-view');

    if (Object.keys(emails).length === 0) {
        email_list_group.innerHTML += `<p>No emails in this mailbox.</p>`
        return
    }

    emails.forEach(email => {

        const email_list_item = document.createElement('a');
        email_list_item.classList.add('list-group-item', 'list-group-item-action');
        email_list_item.setAttribute('href', `/emails/${email.id}`);
        email_list_group.append(email_list_item);

        email_list_item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${email.subject}</h5>
                <small class="text-body-secondary">${email.timestamp}</small>
            </div>
            <p class="mb-1">${email.sender}</p>
        `

        if (email.read) {
            email_list_item.classList.add('list-group-item-secondary');
        }

        email_list_item.addEventListener('click', (event) => {
            event.preventDefault();

            fetch(`emails/${email.id}`)
            .then(response => response.json())
            .then(email => {
                render_email(email);
            })
        });
    });
}

function render_email(email) {

    clear();
    show_view('#email-view');

    const email_view = document.querySelector('#email-view');

    // Archive button
    if (current_mailbox !== 'sent') {
        const archive_button = document.createElement('button');
        archive_button.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'mb-1', 'mr-1');
        email_view.append(archive_button);
        archive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive';

        archive_button.addEventListener('click', () => manage_archive_email(email));
    }

    // Reply button
    const reply_button = document.createElement('button');
    reply_button.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'mb-1', 'mr-1');
    email_view.append(reply_button);
    reply_button.innerHTML = 'Reply';

    // Metadata header
    const metadata = document.createElement('ul');
    metadata.classList.add('list-unstyled');
    email_view.append(metadata);
    metadata.innerHTML = `
        <li><strong>From:</strong> ${email.sender}</li>
        <li><strong>To:</strong> ${email.recipients}</li>
        <li><strong>Subject:</strong> ${email.subject}</li>
        <li><strong>Date:</strong> ${email.timestamp}</li>
    `

    // Email body
    const body = document.createElement('section');
    email_view.append(body);

    body.innerHTML = email.body;

    // Mark as read
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}

function manage_archive_email(email) {

    const archive_switch = email.archived ? false : true;

    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: archive_switch
        })
    })
    .then(() => load_mailbox('inbox'))
}

// Utils

function clear() {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // Clear inbox
    document.querySelector('#emails-view').innerHTML = '';
    document.querySelector('#emails-view').innerHTML = `<h3>${current_mailbox.charAt(0).toUpperCase() + current_mailbox.slice(1)}</h3>`;

    // Clear email view
    document.querySelector('#email-view').innerHTML = '';
}

function feedback_message(destination, message) {

    // Create message component
    const msg = document.createElement('div');
    msg.classList.add('alert', 'alert-primary');
    msg.innerHTML = message;
    document.querySelector(destination).insertAdjacentElement('beforebegin', msg);

    // Destroy message after 6s.
    setInterval(() => {
        msg.remove();
    }, 6000);

}

function show_view(view) {

    const views = [
        '#emails-view',
        '#email-view',
        '#compose-view'
    ]

    // Set the right view to active
    for (selected_view of views) {
        if (selected_view === view) {
            document.querySelector(selected_view).style.display = 'block';
        } else {
            document.querySelector(selected_view).style.display = 'none';
        }
    }

}
