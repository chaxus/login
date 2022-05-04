/*
 * @Author: ran
 * @Date: 2022-05-04 23:34:27
 * @LastEditTime: 2022-05-04 23:53:59
 * @LastEditors: Please set LastEditors
 */
import React from 'react'

interface warnning {
    message: string,
    opacity: true
}

const warnning = ({ message, opacity }: warnning) => {
    return <>
        {opacity ? <div className='warning opacity'>
            {message}
        </div> : <div className='warning'>
            {message}
        </div>}

    </>
}

export default warnning