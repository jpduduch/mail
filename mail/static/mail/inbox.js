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
    document.querySelector('#compose-view').style.display = 'block';
    clear();
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
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
            clear();
            load_mailbox('sent');
            feedback_message('#emails-view > h3', result.message);
        }
    })
}

function render_emails(emails) {

    const email_list = document.querySelector('#emails-view');

    emails.forEach(email => {

        console.log(email)

        const a = document.createElement('a');
        a.classList.add('list-group-item', 'list-group-item-action');
        a.setAttribute('href', '#');
        email_list.append(a);

        const div = document.createElement('div');
        div.classList.add('d-flex', 'w-100', 'justify-content-between');
        a.append(div);

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
        a.append(sender);
        sender.innerHTML = email.sender;

        if (email.read) {
            a.classList.add('list-group-item-secondary');
        }
    });
}


// Utils

function clear() {
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
