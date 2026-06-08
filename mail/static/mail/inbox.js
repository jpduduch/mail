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

            <MainView category={activeView} onSelect={handleActiveView} />

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

function MainView({category, onSelect}) {

    const [emails, setEmails] = React.useState([]);

    const isMailbox = (category === 'inbox' || category === 'sent' || category === 'archived') ? true : false;

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

    if (!isMailbox) {
        return (
            <div>
                <ComposeForm />
            </div>
        );
    }

    return (
        <div>
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

function ComposeForm() {

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

    const [feedback, setFeedback] = React.useState(null);

    function sendMail(event, fields) {
        event.preventDefault();
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: fields.recipients,
                subject: fields.subject,
                body: fields.body
            })
            .then(response => response.json())
            .then(result => {
                setFeedback(()=> {
                    if ("error" in result) {
                        result.error
                    } else {
                        result.message
                    }
                })
            })
        })
    }

    return (
        <div>
            <h2>
                New Mail
            </h2>
            {
                feedback ? <Alert message={feedback} /> : null
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


function Alert(message) {
    return (
        <div className="alert alert-primary">
            {message}
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector("#app"));
