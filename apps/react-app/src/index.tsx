import { createRoot } from 'react-dom/client'

// @ts-ignore
if (typeof window.electron === 'undefined') {
 // @ts-ignore Polyfill to run UI in the browser.
 window.electron = {
	versions: {
	 chrome: 'web',
	 node: 'web',
	 electron: 'web',
	},
	register: () => false,
 }
}

document.body.style.margin = '0'

createRoot(document.body).render(
 <div>
	<main>
	 <h1>Interrogator Web</h1>
	</main>
 </div>,
)
