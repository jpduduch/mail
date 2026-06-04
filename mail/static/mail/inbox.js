/* <TabItem name="Inbox" changeView={() => handleView("inbox")} />
<TabItem name="Compose" changeView={() => handleView("inbox")} />
<TabItem name="Sent" changeView={() => handleView("inbox")} />
<TabItem name="Archived" changeView={() => handleView("inbox")} /> */

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
                return <MailBox name={activeView} />
        }
    }

    return(
        <div>
            {
                views.map(view => {
                    return <TabItem key={view} name={view} getView={() => handleActiveView(view)}  />
                })
            }

            {renderView()}

        </div>
    )
}


function TabItem({name, getView}) {

    return (
        <div>
            <button onClick={getView}>
                {name}
            </button>
        </div>
    )
}

function MailBox({name}) {
    return (
        <div>
            {name}
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector("#app"));
