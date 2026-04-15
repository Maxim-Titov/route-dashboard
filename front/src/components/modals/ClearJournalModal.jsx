import React from "react"

class ClearJournalModal extends React.Component {
    clearJournal = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/journal/clear`)
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        return (
            <div className="modal-wrapper">
                <div className="clear-journal-modal">
                    <div className="header">
                        <h2>
                            Очистити журнал змін?
                        </h2>
                    </div>

                    <div className="body">
                        <p>Ви впевнені, що хочете очистити журнал змін?</p>
                    </div>

                    <div className="footer">
                        <button type="button" className="inter-font yes" onClick={async () => {
                            await this.clearJournal()
                            this.props.setRenderClearJournalModal(false)
                        }}>Гаразд</button>
                        <button type="button" className="inter-font no" onClick={() => {
                            this.props.setRenderClearJournalModal(false)
                        }}>Скасувати</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default ClearJournalModal