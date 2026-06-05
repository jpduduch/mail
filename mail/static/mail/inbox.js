function App() {

    let main;
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

    function renderView() {
        switch (activeView) {
            case 'compose':
                console.log(activeView);
                break
            case 'email':
                console.log(activeView);
                break
            default:
                return <MailBox category={activeView} />
        }
    }

    return(
        <nav>
            {
                views.map(view => {
                    return <TabItem key={view} name={view} onSelect={() => handleActiveView(view)}  />
                })
            }

            {renderView()}

        </nav>
    )
}


function TabItem({name, onSelect}) {

    return (
        <button onClick={onSelect} className="btn btn-sm btn-outline-primary mr-1">
            {name}
        </button>
    )
}

function MailBox({category, onSelect}) {

    const [emails, setEmails] = React.useState([]);

    React.useEffect(() => {
        fetch(`/emails/${category}`)
        .then(response => response.json())
        .then(data => {
            setEmails(data)
        })
    }, [category])

    return (
        <div>
            {emails.map(data => console.log(data))}
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector("#app"));
