function App() {
    const views = [
        "Inbox",
        "Compose",
        "Sent",
        "Archive"
    ]

    const [activeView, setActiveView] = React.useState("inbox");
    const [emailID, setEmailID] = React.useState(null);

    function handleActiveView(name, event = null, emailID = null) {
        if (event) {
            event.preventDefault();
        }

        if (emailID) {
            setEmailID(emailID);
        }

        setActiveView(name.toLowerCase())
    }

    return(
        <div>
            <nav>
                {
                    views.map(view => {
                        return <TabItem key={view} name={view} onSelect={(event) => handleActiveView(view, event)}  />
                    })
                }
            </nav>
            <hr />
            <MainView category={activeView} loadView={handleActiveView} emailID={emailID}  />
        </div>
    )
}

function TabItem({name, onSelect}) {

    return (
        <button onClick={onSelect} className="btn btn-sm btn-outline-primary mr-1">
            {name}
        </button>
    )
}

function MainView({category, loadView, emailID}) {

    const [emails, setEmails] = React.useState([]);
    const [alert, setAlert] = React.useState(null);
    const [email, setEmail] = React.useState({});

    function handleAlert(alert) {
        setAlert(alert);
    }

    // Listen if a alert is active and destroy alert inline component after 6s.
    React.useEffect(() => {
        if (!alert) return;

        const timer = setTimeout(() => setAlert(null), 6000);
        return () => clearTimeout(timer);
    }, [alert])

    const isMailbox = (category === 'inbox' || category === 'sent' || category === 'archive') ? true : false;

    // Load mailbox data when a tab item is clicked
    React.useEffect(() => {

        if (!isMailbox) return;

        fetch(`/emails/${category}`)
        .then(response => response.json())
        .then(metadata => {
            setEmails(metadata);
        })

    }, [category])

    React.useEffect(() => {
        if (category !== 'email') return;

        fetch(`emails/${emailID}`)
        .then(response => response.json())
        .then(email => {
            setEmail(email);

            fetch(`emails/${emailID}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
            })


        })
    }, [emailID])
    
    if (category === 'email') {
        return (
            <div>
                <MailBody category={category} email={email} loadView={loadView} />
            </div>
        )
    }

    // render Compose Form
    if (!isMailbox) {
        return (
            <div>
                <ComposeForm onSuccess={loadView} sendAlert={handleAlert} alert={alert} />
            </div>
        );
    }


    // Render Emails
    return (
        <div>
            {alert ? <Alert message={alert} /> : null }
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            {
                emails.length === 0 ?
                'No emails in this mailbox.' :
                emails.map(metadata => <MailListItem metadata={metadata} onSelect={loadView} />)
            }
        </div>
    )
}

function MailListItem({metadata, onSelect}) {
    const isRead = metadata.read ? 'list-group-item-secondary' : '';

    return (
        <div>
            <a
                href={`emails/${metadata.id}`}
                className={`list-group-item list-group-item-action mb-1 ${isRead}`}
                onClick={(event) => {onSelect('email', event, metadata.id)}}
            >
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{metadata.subject}</h5>
                    <small className="text-body-secondary">{metadata.timestamp}</small>
                </div>
                <p className="mb-1">{metadata.sender}</p>
            </a>
        </div>
    )
}

function MailBody({category, email, loadView}) {

    function archive(email) {
        console.log(email.archived)
        const archive_switch = email.archived ? false : true;
        console.log(archive_switch)

        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: archive_switch
            })
        })
        .then(() => loadView("archive") )
    }

    return (
            <div>
                <TabItem name="Reply" />

                {console.log(category)}

                {   
                    category !== 'sent' ? 
                    <TabItem name="Archive" onSelect={ () => archive(email) } /> : null
                }

                <ul className="list-unstyled">
                    <li><strong>From:</strong> {email.sender}</li>
                    <li><strong>To:</strong> {email.recipients}</li>
                    <li><strong>Subject:</strong> {email.subject}</li>
                    <li><strong>Date:</strong> {email.timestamp}</li>
                </ul>

                <div>
                    {email.body}
                </div>
            </div>
        )
}

function ComposeForm({onSuccess, sendAlert, alert}) {

    const [mailFields, setMailFields] = React.useState({
        recipients: '',
        subject: '',
        body: ''
    });

    function updateField(event) {

        const { name, value } = event.target;

        setMailFields(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function sendMail(event, fields) {
        event.preventDefault();
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: fields.recipients,
                subject: fields.subject,
                body: fields.body
            })
        })
        .then(response => response.json())
        .then(result => {
            if ('error' in result) {
                sendAlert(result.error)
            } else {
                sendAlert(result.message);
                onSuccess(event, "sent");
            }
        })
    }

    return (
        <div>
            <h2>
                New Mail
            </h2>
            {
                alert ? <Alert message={alert} /> : null
            }
            <form>
                <div className="form-group">
                    From: <input disabled className="form-control" value="Sender (you)" onChange={updateField} />
                </div>
                <div className="form-group">
                    To: <input className="form-control" name="recipients" value={mailFields.recipients} onChange={updateField} />
                </div>
                <div className="form-group">
                    <input className="form-control" name="subject" placeholder="Subject" value={mailFields.subject} onChange={updateField} />
                </div>
                <textarea class="form-control mb-1" name="body" placeholder="Body" value={mailFields.body} onChange={updateField}></textarea>

                <input type="submit" class="btn btn-primary" onClick={(event) => sendMail(event, mailFields)} />
            </form>
        </div>
    )
}


function Alert({message}) {
    return (
        <div className="alert alert-primary">
            {message}
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector("#app"));
