import React from "react"
import { Trash2 } from 'lucide-react'

class ClearJournalButton extends React.Component {
    render() {
        return (
            <button className={`clear-journal-button ${this.props.role === 'user' ? 'forbidden' : ''}`} type="button" onClick={() => this.props.setRenderClearJournalModal(true)}>
                <Trash2 />
                <p className="inter-font">Очистити журнал</p>
            </button>
        )
    }
}

export default ClearJournalButton