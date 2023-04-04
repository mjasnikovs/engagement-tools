const {ipcRenderer} = window.require('electron')

const HyperLinks = () => {
	const openLink = (url: string) => ipcRenderer.invoke('open-external', url)

	return (
		<div className='container'>
			<div className='row'>
				<div className='column'>
					<button
						className='button button-clear float-right'
						onClick={() => openLink('https://streamelements.com/lielaiswuu/tip')}
					>
						support
					</button>
					<button
						className='button button-clear float-right'
						onClick={() => openLink('https://www.twitch.tv/lielaiswuu')}
					>
						twitch
					</button>
				</div>
			</div>
		</div>
	)
}

export default HyperLinks
