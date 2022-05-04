import React from 'react'

interface warnning {
    message:string
}

const warnning = ({ message }:warnning) => {
    return <div className='warning error qwe'>
        { message }
    </div>
}

export default warnning