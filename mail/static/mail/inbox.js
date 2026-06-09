function App() {
    const views = [
        "Inbox",
        "Compose",
        "Sent",
        "Archived"
    ]

    const [activeView, setActiveView] = React.useState("inbox");

    function handleActiveView(name) {
        setActiveView(name.toLowerCase())
    }

    return(
        <div>
            <nav>
                {
                    views.map(view => {
                        return <TabItem key={view} name={view} onSelect={() => handleActiveView(view)}  />
                    })
                }
            </nav>

            <hr />

            <MainView category={activeView} loadView={handleActiveView} />

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

function MainView({category, loadView}) {

    const [emails, setEmails] = React.useState([]);
    const [alert, setAlert] = React.useState(null);

    function handleAlert(alert) {
        setAlert(alert);
    }

    // Listen if a alert is active and destroy alert inline component after 6s.
    React.useEffect(() => {
        if (!alert) return;

        const timer = setTimeout(() => setAlert(null), 6000);
        return () => clearTimeout(timer);
    }, [alert])

    const isMailbox = (category === 'inbox' || category === 'sent' || category === 'archived') ? true : false;

    // Load mailbox data when a tab item is clicked
    React.useEffect(() => {

        if (!isMailbox) {
            return;
        }

        fetch(`/emails/${category}`)
        .then(response => response.json())
        .then(metadata => {
            setEmails(metadata);
        })
    }, [category])

    // renders
    if (!isMailbox) {
        return (
            <div>
                <ComposeForm onSuccess={loadView} sendAlert={handleAlert} alert={alert} />
            </div>
        );
    }

    return (
        <div>
            {alert ? <Alert message={alert} /> : null }
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            {emails.map(metadata => <MailListItem metadata={metadata} />)}
        </div>
    )
}

function MailListItem({metadata, onSelect}) {
    const isRead = metadata.read ? 'list-group-item-secondary' : '';

    function loadMail(event, id) {
        event.preventDefault();
        // todo
    }

    return (
        <div>
            <a
                href={`emails/${metadata.id}`}
                className={`list-group-item list-group-item-action mb-1 ${isRead}`}
                onClick={(event) => { loadMail(event, metadata.id) }}
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
                onSuccess("sent");
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
