/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import Header from './Header'
import Controls from './Controls'
import Blocks from './Blocks'
import { getIpfs, ipfsAdd, ipfsGet, resetRepo, removeUnpinned, unpinAll, getBlockInfo } from './lib/ipfs'
import DropTarget from './DropTarget'
import NodeInfo from './NodeInfo'

export default function App () {
  const [files, setFiles] = useState([])
  const [chunker, setChunker] = useState('size-1024')
  const [rootCid, setRootCid] = useState(null)
  const [focusedNode, setFocusedNode] = useState(null)
  const [blockInfo, setBlockInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cidToGet, setCidToGet] = useState('')

  useEffect(() => {
    if (!files.length) return
    const addFiles = async () => {
      setRootCid(null)
      setLoading(true)
      const cid = await ipfsAdd({ files, chunker })
      setLoading(false)
      setRootCid(cid)
    }
    addFiles()
  }, [files, chunker])

  // update block info when focusedNode changes
  useEffect(() => {
    console.log('update block info effect')
    if (!focusedNode) return
    const fn = async () => {
      const res = await getBlockInfo(focusedNode)
      console.log('updating info for focusedNode', focusedNode, res.id)
      if (focusedNode === res.id) {
        setBlockInfo(res)
      }
    }
    fn()
  }, [focusedNode])

  const onFilesChange = files => {
    setFiles(files.map(file => ({ path: file.name, content: file })))
  }

  const onCidSubmit = async e => {
    setRootCid(null)
    setLoading(true)
    await ipfsGet(cidToGet)
    setRootCid(cidToGet)
  }

  const onReset = async () => {
    setLoading(true)
    setFiles([])
    setChunker('size-1024')
    setRootCid(null)
    setFocusedNode(null)
    await resetRepo()
    await getIpfs()
    setLoading(false)
    console.log('reset complete')
  }

  const onUnpinAll = async () => {
    setLoading(true)
    await unpinAll()
    setLoading(false)
  }

  const onRemoveUnpinned = async () => {
    console.log('remove unpinned')
    setLoading(true)
    await removeUnpinned()
    setLoading(false)
    console.log('remove unpinned done')
  }

  return (
    <div className='avenir flex flex-column h-100'>
      <div className='flex-none'>
        <Header>
          <div className='dn'>
            <form onSubmit={onCidSubmit} className='flex items-center'>
              <input type='text' value={cidToGet} className='mh3 br2 ba b--silver pa2 f5 dib w5' placeholder='QmHash' />
              <button
                type='submit'
                className='mr2 transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 ph4 pv1 pointer focus-outline bg-green-muted hover-bg-green white'
                title='ipfs.get a CID'>
                Get
              </button>
            </form>
          </div>
        </Header>
      </div>
      <div className='flex-none'>
        <Controls
          chunker={chunker}
          onChunkerChange={setChunker}
          onReset={onReset}
          onGc={onRemoveUnpinned}
          onUnpinAll={onUnpinAll}
          loading={loading} />
      </div>
      <div className='flex-auto'>
        <DropTarget onFileDrop={onFilesChange} className='h-100'>
          <div className='flex flex-column h-100'>
            <div className='flex-auto relative'>
              <Blocks onNodeFocus={setFocusedNode} />
            </div>
            <div className='flex-none'>
              <NodeInfo info={blockInfo} />
            </div>
          </div>
        </DropTarget>
      </div>
    </div>
  )
}
