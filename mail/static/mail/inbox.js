function App() {

    const [activeView, setActiveView] = React.useState("inbox");

    return (
        <div>
            {/* Top menu */}
            <nav>
                <TabItem name="Inbox" onSelect={() => setActiveView("inbox")} />
                <TabItem name="Compose" onSelect={() => setActiveView("compose")} />
                <TabItem name="Sent" onSelect={() => setActiveView("sent")} />
                <TabItem name="Archived" onSelect={() => setActiveView("archived")} />
            </nav>
            {activeView === 'compose' ? <ComposeForm /> : <MailBox name={activeView} />}
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
    return(
        <div className="p-3 text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-3">
            {name} "test"
        </div>
    )

}

function ComposeForm() {

}

ReactDOM.render(<App />, document.querySelector("#app"));
