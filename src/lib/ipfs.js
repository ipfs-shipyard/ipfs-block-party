import IPFS from 'ipfs'
import { openDB } from 'idb'
import { DAGNode } from 'ipld-dag-pb'
import UnixFs from 'ipfs-unixfs'

const repo = 'ipfs-block-party'

let ipfs, ipfsReady

export function getIpfs () {
  if (ipfsReady) return ipfsReady

  ipfsReady = new Promise((resolve, reject) => {
    ipfs = window.ipfs = new IPFS({
      repo,
      preload: {
        enabled: false
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          ]
        },
        Bootstrap: [
          '/ip6/::1/tcp/4001/ipfs/QmS2H72gdrekXJggGdE9SunXPntBqdkJdkXQJjuxcH8Cbt'
        ]
      }
    })
    ipfs.on('ready', () => resolve(ipfs)).on('error', reject)
  })

  return ipfsReady
}

export async function ipfsAdd ({ files, chunker }) {
  const ipfs = await getIpfs()

  console.log('adding', { files, chunker })

  const res = await ipfs.add(files, {
    chunker
  })

  console.log('added', res[res.length - 1].hash)
  return res[res.length - 1].hash
}

export async function ipfsGet (cid) {
  const ipfs = await getIpfs()
  console.log('getting', cid)
  const res = await ipfs.get(cid)
  console.log('got', res)
  return res
}

export async function getBlockInfo (cid) {
  const { value: block } = await ipfs.dag.get(cid)
  if (!DAGNode.isDAGNode(block)) {
    console.log('getBlockInfo block for cid is not a valid dagNode', cid, block)
  }
  let nodeData = {
    id: cid
  }
  try {
    // it's a unix system?
    const unixfsData = UnixFs.unmarshal(block.Data)
    nodeData = {
      type: 'unixfs',
      isLeaf: Boolean(block.Links.length),
      length: (await ipfs.block.get(cid)).data.length,
      unixfsData,
      ...nodeData
    }
  } catch (err) {
    // dag-pb but not a unixfs.
    // could be a pinset block
  }
  return nodeData
}

// simulate GC
export async function removeUnpinned () {
  const ipfs = await getIpfs()
  const pins = await ipfs.pin.ls()
  console.log('got pins', pins)
  // const mfsRoot = await ipfs.files.stat('/')
  // console.log('got mfs root', mfsRoot)
  const refs = await ipfs.refs.local()
  const toKeep = pins.map(pin => pin.hash)
  const toRemove = refs
    .map(ref => ref.ref)
    // .filter(cid => !toKeep.includes(cid) || cid !== mfsRoot.hash)
    .filter(cid => !toKeep.includes(cid))
  console.log('removeUnpinned', toRemove)
  for (let cid of toRemove) {
    const node = await getBlockInfo(cid)
    if (node.type) {
      ipfs.block.rm(cid)
    } else {
      // is pinset data, ignore
    }
  }
}

export async function unpinAll () {
  const ipfs = await getIpfs()
  const pins = await ipfs.pin.ls()
  const toUnpin = pins.filter(pin => pin.type === 'recursive' || pin.type === 'direct')
  console.log('unpinAll', toUnpin)
  if (toUnpin.length) {
    return Promise.all(toUnpin.map(pin => ipfs.pin.rm(pin.hash)))
  }
  return Promise.resolve()
}

export async function unpinAllAndGC () {
  const pins = await ipfs.pin.ls()
  const toUnpin = pins.filter(pin => pin.type === 'recursive' || pin.type === 'direct')
  if (toUnpin.length) {
    await Promise.all(toUnpin.map(pin => ipfs.pin.rm(pin.hash)))
  }
}

export async function runGC () {
  const ipfs = await getIpfs()
  return ipfs.repo.gc()
}

export async function resetRepo () {
  if (ipfs) {
    await ipfs.stop()
    ipfs = null
    ipfsReady = false
    await deleteRepo(repo)
  }
}
window.resetRepo = resetRepo

function deleteRepo (repo) {
  const dbs = [`${repo}/blocks`, `${repo}/datastore`, `${repo}/keys`]
  return Promise.all(dbs.map(name => requestDbDelete(name)))
}

function requestDbDelete (name) {
  return new Promise((resolve, reject) => {
    var req = window.indexedDB.deleteDatabase(name)
    req.onerror = evt => {
      console.log('error deleting db', name, evt)
      reject(evt)
    }
    req.onsuccess = evt => {
      console.log('db deleted', name)
      resolve()
    }
  })
}

export async function getRepoStats () {
  const ipfs = await getIpfs()
  const stats = await ipfs.repo.stat()
  console.log('repo stats', stats)
  return stats
}

export async function getPins () {
  const ipfs = await getIpfs()
  const pins = await ipfs.pin.ls()
  console.log('pins', pins)
  return pins
}

// TODO: an api to get blocks from blockstore
export async function getAllBlocks () {
  const dbName = `${repo}/blocks`
  const db = await openDB(dbName, 2)
  const keys = await db.getAllKeys(dbName)
  console.log(keys)
}

window.getAllBlocks = getAllBlocks

/*
  @return [{group: }]
*/
export async function getLocalBlockData () {
  let pins = await getPins()
  const pinMap = new Map()
  pins.forEach(pin => pinMap.set(pin.hash, pin))
  pins = null
  const ipfs = await getIpfs()
  const refs = await ipfs.refs.local()
  const res = refs.map(ref => {
    const pin = pinMap.get(ref.ref)
    return {
      group: 'nodes',
      data: {
        id: ref.ref,
        type: pin ? pin.type : undefined
      },
      classes: [pin ? 'pin' : 'unpinned']
    }
  })
  return res
}
