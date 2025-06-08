import * as React from 'react';
import { Toggle } from '@base-ui-components/react/toggle';
import { ToggleGroup } from '@base-ui-components/react/toggle-group';
import {Tablet, Smartphone, Laptop, Monitor, Maximize2, RotateCw} from 'lucide-react';
import { Separator } from '@base-ui-components/react/separator';
import DialogExample from './DialogExample';

type Props = {
  previewIframe: React.ReactNode
  fullscreen?: boolean
}

export default function Toolbar({ previewIframe, fullscreen }: Props  ) {
  return (
    <ToggleGroup
      defaultValue={['laptop']}
      className="flex gap-px rounded-md border border-gray-200 p-0.5 bg-white"
    >
      <Toggle
        title='Phone'
        aria-label="Phone"
        value="phone"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
      >
        <Smartphone className="size-4" />
      </Toggle>
      <Toggle
        title='Tablet'
        aria-label="Tablet"
        value="tablet"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
      >
        <Tablet className="size-4" />
      </Toggle>
      <Toggle
        title='Laptop'
        aria-label="Laptop"
        value="laptop"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
      >
        <Laptop className="size-4" />
      </Toggle>
      <Toggle
        title='Desktop'
        aria-label="Desktop"
        value="desktop"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
      >
        <Monitor className="size-4" />
      </Toggle>
      <Separator orientation="vertical" className="w-px bg-gray-200 mx-0.5" />
      {fullscreen && <DialogExample previewIframe={previewIframe} />}
      <button
        title='Refresh'
        aria-label="Refresh"
        value="refresh"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
      >
        <RotateCw className="size-4" />
      </button> 
    </ToggleGroup>
  )
}