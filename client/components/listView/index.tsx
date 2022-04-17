import React, { useEffect, useRef } from 'react'
import { Spin } from 'antd'

const ListView = props => {
  let { children, load, hasMore } = props
  const listViewRef = useRef<HTMLDivElement>(null)
  const intersectionObserverRef = useRef<IntersectionObserver>()
  const loadRef = useRef(load)

  const initIntersectionObserver = () => {
    // 使用IntersectionObserver观察滚动加载
    intersectionObserverRef.current = new IntersectionObserver(entries => {
      if (entries[0].intersectionRatio > 0) {
        loadRef.current()
      }
    })
  }

  useEffect(() => {
    initIntersectionObserver()
    if (listViewRef.current) {
      intersectionObserverRef.current?.observe(listViewRef.current)
    }
    return () => {
      if (listViewRef.current) {
        intersectionObserverRef.current?.unobserve(listViewRef.current)
      }
    }
  }, [])

  useEffect(() => {
    loadRef.current = load
  }, [load])

  return (
    <div className="list-view">
      {children}
      <div className="list-view-loading" ref={listViewRef} style={{ display: hasMore ? '' : 'none' }}>
        <Spin />
          &nbsp;努力加载中
      </div>
    </div>
  )
}

export default ListView
