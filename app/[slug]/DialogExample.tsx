import * as React from 'react'
import { Dialog } from '@base-ui-components/react/dialog'
import { Maximize2 } from 'lucide-react'
import PreviewContainer from './PreviewContainer'

type Props = {
  previewIframe: React.ReactNode
}
export default function DialogExample({ previewIframe }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900">
        <Maximize2 className="w-4 h-4" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed z-10 inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
        <Dialog.Popup className="fixed z-10 top-1/2 left-1/2 w-screen max-w-[calc(100vw-3rem)] h-screen max-h-[calc(100vh-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
          <PreviewContainer previewIframe={previewIframe} />
          {/* <div className="flex justify-end gap-4">
            <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
              Close
            </Dialog.Close>
          </div> */}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
