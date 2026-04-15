import React from "react"

class UserLogo extends React.Component {
    render() {
        return (
            <>
                <div className="user-logo" onClick={() => this.props.setIsRenderProfileModal(true)}>
                    <p>{this.props.context?.user?.name[0]}{this.props.context?.user?.surname[0]}</p>
                </div>
            </>
        )
    }
}

export default UserLogo