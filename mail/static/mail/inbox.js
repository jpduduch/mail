function App() {
    return (

        <div>
            // Top menu
            <nav>
                <TabItem name="Inbox" />
                <TabItem name="Compose" />
                <TabItem name="Sent" />
                <TabItem name="Archive" />
                <TabItem name="Log Out" />
            </nav>

            <MailListItem />
        </div>
    )
}

// Components

function TabItem(props) {
    return (
        <button
            className="btn btn-sm btn-outline-primary"
            id={(props.name.toLowerCase())}
            // onClick={load_mailbox(props.name.toLowerCase())}
        >
            {props.name}
        </button>
    )
}

function MailListItem(name) {

    // receber dados de fetch
    // processar se houver algo a fazer

    //renderizar
    return (
        <div>
            <a href="#" className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">Email subject</h5>
                    <small className="text-body secondary">Date</small>
                </div>
                <p className="mb-1">sender</p>
            </a>
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector("#app"));
