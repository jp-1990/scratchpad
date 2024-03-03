'use client'

import React from 'react';
import GridLayout, { Layout } from "react-grid-layout";
import "../../node_modules/react-grid-layout/css/styles.css";
import "../../node_modules/react-resizable/css/styles.css";

type WidgetProps = {
  bg: string
  onRemove: (e: any, id: any) => void
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
    '0': { key: '0', size: 'large', bg: 'bg-red-500', 'data-grid': { i: '0', w: 2, h: 2, x: 0, y: 0 } },
    '1': { key: '1', size: 'large', bg: 'bg-blue-500', 'data-grid': { i: '1', w: 2, h: 2, x: 2, y: 0 } },
    '2': { key: '2', size: 'small', bg: 'bg-green-500', 'data-grid': { i: '2', w: 1, h: 1, x: 0, y: 2 } },
  })

  const layout = React.useRef<Layout[]>([])
  const maxY = React.useRef<number>(2)

  function addWidget(size: string) {
    setWidgets(prev => {
      // build grid to check free areas
      const matrix: number[][] = []
      for (let i = 0; i <= maxY.current + 4; i++) {
        const row: number[] = []
        for (let j = 0; j < 4; j++) {
          row.push(0)
        }
        matrix.push(row);
      }

      // populate grid with taken cells
      for (const l of layout.current) {
        const size = prev[l.i as keyof typeof widgets].size

        matrix[l.y][l.x] = 1;
        switch (size) {
          case 'small':
            if (l.y > maxY.current) maxY.current = l.y
            continue

          case 'large':
            matrix[l.y][l.x + 1] = 1;
            matrix[l.y + 1][l.x] = 1;
            matrix[l.y + 1][l.x + 1] = 1;
            if (l.y + 1 > maxY.current) maxY.current = l.y
            continue

          case 'long':
            matrix[l.y][l.x + 1] = 1;
            matrix[l.y][l.x + 2] = 1;
            matrix[l.y][l.x + 3] = 1;
            if (l.y > maxY.current) maxY.current = l.y
            continue
        }


        prev[l.i as keyof typeof widgets]['data-grid'] = l
      }

      // find first available location based on size 
      let firstGap = [0, 0];
      outer: for (let i = 0; i <= maxY.current + 4; i++) {
        if (firstGap[0] || firstGap[1]) break;
        for (let j = 0; j < 4; j++) {
          // skip row
          if (j === 0 && size === 'long' && matrix[i][j] === 1) continue;

          if (matrix[i][j] === 0) {
            switch (size) {
              case 'small':
                firstGap = [i, j];
                break outer;

              case 'large': {
                const willFit = matrix[i + 1]?.[j] === 0 && matrix[i]?.[j + 1] === 0 && matrix[i + 1]?.[j + 1] === 0
                if (willFit) {
                  firstGap = [i, j];
                  break outer
                }
              }

              case 'long': {
                const willFit = matrix[i]?.[j + 1] === 0 && matrix[i]?.[j + 2] === 0 && matrix[i]?.[j + 3] === 0
                if (willFit) {
                  firstGap = [i, j];
                  break outer
                }
              }
            }

          }
        }
      }

      const bg = [
        'bg-purple-500',
        'bg-green-500',
        'bg-red-500',
        'bg-orange-500',
        'bg-teal-500',
        'bg-blue-500',
      ]


      const id = crypto.randomUUID()
      const [width, height] = size === 'large' ? [2, 2] : size === 'small' ? [1, 1] : [4, 1]
      const w = {
        key: id,
        size: size,
        bg: bg[Math.floor(Math.random() * bg.length)],
        'data-grid': { i: id, x: firstGap[1], y: firstGap[0], w: width, h: height }
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
    console.log('LAYOUT_CHANGE:', layout)
  }

  return (
    <div className='relative'>
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

      <div className='fixed bottom-6 right-6 font-mono flex flex-col'>
        <button className='px-3 py-1 my-1 rounded-md bg-gray-50 text-gray-900 text-xl' onClick={() => addWidget('small')}>ADD 1x1</button>
        <button className='px-3 py-1 my-1 rounded-md bg-gray-50 text-gray-900 text-xl' onClick={() => addWidget('large')}>ADD 2x2</button>
        <button className='px-3 py-1 my-1 rounded-md bg-gray-50 text-gray-900 text-xl' onClick={() => addWidget('long')}>ADD 4x1</button>
      </div>
    </div>
  );
}
