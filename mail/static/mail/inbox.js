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
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    clear_composition_fields();
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

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
            feedback_message('#compose-view > h3', result.error);
        } else {
            clear_composition_fields();
            load_mailbox('sent');
            feedback_message('#emails-view > h3', result.message);
        }
    })
}

function render_emails(emails) {

    const email_list_group = document.querySelector('#emails-view');

    if (Object.keys(emails).length === 0) {
        email_list_group.innerHTML = `<p>No emails in this mailbox.</p>`
        return
    }

    emails.forEach(email => {

        const email_list_item = document.createElement('a');
        email_list_item.classList.add('list-group-item', 'list-group-item-action');
        email_list_item.setAttribute('href', `/emails/${email.id}`);
        email_list_group.append(email_list_item);

        const div = document.createElement('div');
        div.classList.add('d-flex', 'w-100', 'justify-content-between');
        email_list_item.append(div);

        const title = document.createElement('h5');
        title.classList.add('mb-1');
        div.append(title);
        title.innerHTML = email.subject;

        const date = document.createElement('small');
        date.classList.add('text-body-secondary');
        div.append(date);
        date.innerHTML = email.timestamp;

        const sender = document.createElement('p');
        sender.classList.add('mb-1');
        email_list_item.append(sender);
        sender.innerHTML = email.sender;

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

    // Clear inbox to clear memory usage
    document.querySelector('#emails-view').innerHTML = ''

    // Show email view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Clear any previous content
    const email_body = document.querySelector('#email-view');
    email_body.innerHTML = '';

    email_body.innerHTML = `
        <ul class="list-unstyled">
            <li><strong>From:</strong> ${email.sender}</li>
            <li><strong>To:</strong> ${email.recipients}</li>
            <li><strong>Subject:</strong> ${email.subject}</li>
            <li><strong>Date:</strong> ${email.timestamp}</li>
        </ul>

        <hr>
    `

    const body = document.createElement('section');
    email_body.append(body);

    body.innerHTML = email.body;

    // Mark as read
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}


// Utils

function clear_composition_fields() {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function feedback_message(destination, message) {

    // Create message component
    const msg = document.createElement('div');
    msg.classList.add('alert', 'alert-primary');
    msg.innerHTML = message;
    document.querySelector(destination).insertAdjacentElement('afterend', msg);

    // Destroy message after 6s.
    setInterval(() => {
        msg.remove();
    }, 6000);

}
