import React from 'react'
import Spinner from './Spinner'

export default function Controls ({
  chunker,
  onChunkerChange,
  onReset,
  onGc,
  onUnpinAll,
  loading
}) {
  return (
    <div className='flex flex-row items-center pa3 bg-white'>
      <div className='mr3'>
        <select
          value={chunker}
          onChange={e => onChunkerChange(e.target.value)}
          className='charcoal ba b--black-20 br1 pv1 ph2 db center focus-outline'>
          <option value='size-32'>32 byte chunks</option>
          <option value='size-512'>512 byte chunks</option>
          <option value='size-1024'>1,024 byte chunks</option>
          <option value='size-16384'>16,384 byte chunks</option>
          <option value='size-262144'>26,2144 byte chunks</option>
        </select>
      </div>
      <div className='flex-auto'>
        <Spinner show={loading} />
      </div>
      <button
        type='button'
        onClick={e => onUnpinAll()}
        className='mr2 transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 ph4 pv1 pointer focus-outline bg-aqua-muted hover-bg-aqua white'
        title='Unpin all pinned blocks'>
        Unpin all
      </button>
      <button
        type='button'
        onClick={e => onGc()}
        className='mr2 transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 ph4 pv1 pointer focus-outline bg-yellow-muted hover-bg-yellow white'
        title='Simulate GC by deleting unpinned blocks'>
        Run GC
      </button>
      <button
        type='button'
        onClick={e => onReset()}
        className='dn transition-all sans-serif v-mid fw5 nowrap lh-copy bn br1 ph4 pv1 pointer focus-outline bg-red-muted hover-bg-red white'
        title='Delete the repo and re-initialise IPFS'>
        Reset
      </button>
    </div>
  )
}
