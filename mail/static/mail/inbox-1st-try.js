// import React from "react";

function App() {

    const [activeView, setActiveView] = React.useState("inbox");

    let mainView;
    switch (activeView){
        case 'compose':
            mainView = <ComposeForm />
            break
        case 'render email':
            mainView = <Mail />
            break
        default:
            mainView = <MailBox name={activeView} onSelect={() => setActiveView} />
    }

    return (
        <div>
            {/* Top menu */}
            <nav>
                <TabItem name="Inbox" onSelect={() => setActiveView("inbox")} />
                <TabItem name="Compose" onSelect={() => setActiveView("compose")} />
                <TabItem name="Sent" onSelect={() => setActiveView("sent")} />
                <TabItem name="Archived" onSelect={() => setActiveView("archived")} />
            </nav>
            <hr />
            {mainView}
        </div>
    )
}

// Components

function TabItem({name, onSelect}) {

    return (
        <button
            className="btn btn-sm btn-outline-primary mr-1"
            onClick={onSelect}
            >
            {name}
        </button>
    )
}

function MailBox({name}) {

    const [emails, setEmails] = React.useState([]);

    // "if name changes, run this."
    React.useEffect(() => {
        fetch(`/emails/${name}`)
        .then(response => response.json())
        .then(data => setEmails(data))
    }, [name])

    return(
        <div>
            {emails.map(metadata => (<MailListItem key={metadata.id} metadata={metadata} />))}
        </div>
    )
}

function MailListItem({metadata}) {

    const isRead = metadata.read ? 'list-group-item-secondary' : '' ;

    function loadMail(event, id) {
        event.preventDefault();
    }

    return (
        <div>
            <a
            href={`emails/${metadata.id}`}
            className={`list-group-item list-group-item-action mb-1 ${isRead}`}
            onClick={(event) => {loadMail(event, metadata.id)}}
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

function Mail() {
    return (
        <div>
            test
        </div>
    )
}

function ComposeForm() {

}

ReactDOM.render(<App />, document.querySelector("#app"));
