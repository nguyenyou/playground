import { Tabs } from '@base-ui-components/react/tabs'

export const FileExplorer = ({ files }) => {
  return (
    <Tabs.Root className="rounded-md border border-gray-200" defaultValue="index.html">
      <Tabs.List className="relative z-0 flex gap-1 px-1 shadow-[inset_0_-1px] shadow-gray-200">
        <Tabs.Tab
          className="flex h-8 items-center justify-center border-0 px-2 text-sm font-medium text-gray-600 outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline-2 data-[selected]:text-gray-900"
          value="index.html"
        >
          index.html
        </Tabs.Tab>
        <Tabs.Tab
          className="flex h-8 items-center justify-center border-0 px-2 text-sm font-medium text-gray-600 outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline-2 data-[selected]:text-gray-900"
          value="styles.css"
        >
          styles.css
        </Tabs.Tab>
        <Tabs.Tab
          className="flex h-8 items-center justify-center border-0 px-2 text-sm font-medium text-gray-600 outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline-2 data-[selected]:text-gray-900"
          value="index.js"
        >
          index.js
        </Tabs.Tab>
        <Tabs.Indicator className="absolute top-1/2 left-0 z-[-1] h-6 w-[var(--active-tab-width)] -translate-y-1/2 translate-x-[var(--active-tab-left)] rounded-sm bg-gray-100 transition-all duration-200 ease-in-out" />
      </Tabs.List>
      <Tabs.Panel className="h-32" value="index.html">
        <pre className="h-full overflow-auto">{files['/index.html']?.code}</pre>
      </Tabs.Panel>
      <Tabs.Panel className="h-32" value="styles.css">
        <pre className="h-full overflow-auto">{files['/styles.css']?.code}</pre>
      </Tabs.Panel>
      <Tabs.Panel className="h-32" value="index.js">
        <pre className="h-full overflow-auto">{files['/index.js']?.code}</pre>
      </Tabs.Panel>
    </Tabs.Root>
  )
}
