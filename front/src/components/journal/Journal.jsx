import React from "react"

import ViewHeader from "../ViewHeader"
import ChangesList from "./ChangesList"
import ClearJournalButton from "../ClearJournalButton"
import ClearJournalModal from "../modals/ClearJournalModal"

class Journal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            renderClearJournalModal: false
        }
    }

    setRenderClearJournalModal = (value) => {
        this.setState({ renderClearJournalModal: value })
    }

    render() {
        return (
            <div className="journal-wrapper">
                <div className="container">
                    <div className="header">
                        <ViewHeader title='Журнал змін' subtitle='Історія дій та змін у системі' />

                        <div className="buttons-wrapper">
                            <ClearJournalButton role={this.props.user?.role} setRenderClearJournalModal={this.setRenderClearJournalModal} />
                        </div>
                    </div>

                    <ChangesList />
                </div>

                {this.state.renderClearJournalModal && <ClearJournalModal setRenderClearJournalModal={this.setRenderClearJournalModal} />}
            </div>
        )
    }
}

export default Journal