'use client'

import React, { useId } from 'react';
import GridLayout, { Layout } from "react-grid-layout";
import "../../node_modules/react-grid-layout/css/styles.css";
import "../../node_modules/react-resizable/css/styles.css";

const defaultLayout = { i: '', x: 0, y: 0, w: 1, h: 1, }

type WidgetProps = {
  size: 'large' | 'small',
  bg: string
} & any
const WidgetWithRef = React.forwardRef(function Widget({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, id, onRemove, bg }: WidgetProps, ref: any) {
  return (
    <div style={{ ...style }} className={className} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchEnd={onTouchEnd} ref={ref} >
      <article className='p-1 h-full'>
        <div className={`${bg} h-full flex justify-end items-start`}>
          <button className='p-3 text-lg font-mono on-remove-button' onClick={(e) => onRemove(e, id)}>X</button>
        </div>
      </article>
      {children}
    </div >
  )
})


export default function WidgetPage() {

  const [widgets, setWidgets] = React.useState({
    '0': { key: '0', size: 'large', bg: 'bg-red-500', 'data-grid': { ...defaultLayout, i: '0', w: 2, h: 2, x: 0, y: 0 } },
    '1': { key: '1', size: 'large', bg: 'bg-blue-500', 'data-grid': { ...defaultLayout, i: '1', w: 2, h: 2, x: 2, y: 0 } },
    '2': { key: '2', size: 'small', bg: 'bg-green-500', 'data-grid': { ...defaultLayout, i: '2', w: 1, h: 1, x: 0, y: 2 } },
  })

  const layout = React.useRef<Layout[]>([])
  const maxY = React.useRef<number>(2)

  function addWidget() {
    setWidgets(prev => {
      const matrix: number[][] = []
      for (let i = 0; i <= maxY.current + 1; i++) {
        const row: number[] = []
        for (let j = 0; j < 4; j++) {
          row.push(0)
        }
        matrix.push(row);
      }

      for (const l of layout.current) {
        const isLarge = prev[l.i as keyof typeof widgets].size === 'large'
        matrix[l.y][l.x] = 1;
        if (l.y > maxY.current) maxY.current = l.y

        if (isLarge) {
          matrix[l.y][l.x + 1] = 1;
          matrix[l.y + 1][l.x] = 1;
          matrix[l.y + 1][l.x + 1] = 1;
          if (l.y + 1 > maxY.current) maxY.current = l.y
        }
        prev[l.i as keyof typeof widgets]['data-grid'] = l
      }

      let firstGap = [0, 0];
      for (let i = 0; i <= maxY.current + 1; i++) {
        if (firstGap[0] || firstGap[1]) break;
        for (let j = 0; j < 4; j++) {
          if (matrix[i][j] === 0) {
            firstGap = [i, j];
            break
          }
        }
      }

      console.log(matrix, firstGap)


      const id = crypto.randomUUID()
      const w = {
        key: id,
        size: 'small',
        bg: 'bg-purple-500',
        'data-grid': { i: id, x: firstGap[1], y: firstGap[0], w: 1, h: 1 }
      }

      return { ...prev, [id]: w }
    })
  }

  function onRemove(e: any, id: any) {
    e.stopPropagation()
    setWidgets(prev => {
      const newState = { ...prev }
      delete newState[id as keyof typeof widgets]

      return newState
    }
    )

  }

  function onLayoutChange(l: Layout[]) {
    layout.current = l
    console.log(layout)
  }

  return (
    <>
      <button onClick={addWidget}>ADD</button>
      <GridLayout
        className="layout"
        cols={4}
        rowHeight={300}
        width={1200}
        margin={[0, 0]}
        isResizable={false}
        onLayoutChange={onLayoutChange}
        draggableCancel='.on-remove-button'
      >
        {
          Object.keys(widgets).map((k) => {
            const w = widgets[k as keyof typeof widgets];
            const { key, ...rest } = w
            return (
              <WidgetWithRef key={key} id={key} onRemove={onRemove} {...rest} />
            )
          })
        }

      </GridLayout>
    </>
  );
}
