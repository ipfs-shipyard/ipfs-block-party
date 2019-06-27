import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import cytoscape from 'cytoscape'
import UnixFs from 'ipfs-unixfs'
import { DAGNode } from 'ipld-dag-pb'
import { Buffer } from 'ipfs'
import { getIpfs, getLocalBlockData } from './lib/ipfs'
import DagGraphOptions from './DagGraphOptions'

export default class Blocks extends Component {
  constructor () {
    super()
    this._graphRoot = createRef()
    this.cy = null
  }

  componentDidMount () {
    this._updateGraph()
  }

  componentDidUpdate (prevProps) {
    this._updateGraph()
  }

  async _updateGraph () {
    console.log('update graph')
    if (!this._cy) {
      const container = this._graphRoot.current
      window.cy = this._cy = cytoscape({ container, ...DagGraphOptions })
    }
    const cy = this._cy
    const blocks = await getLocalBlockData()
    cy.elements().remove()
    cy.add(blocks)
    cy.layout(DagGraphOptions.layout).run()

    const focusElement = node => {
      cy.nodes('.focused').removeClass('focused')
      node.addClass('focused')
      if (this.props.onNodeFocus) {
        this.props.onNodeFocus(node.id())
      }
    }

    if (blocks && blocks[0]) {
      console.log('focus', blocks[0])
      focusElement(cy.getElementById(cy.nodes().first()))
    }

    cy.on('tap', e => {
      if (!e.target.id && !e.target.group) return
      if (!this.props.onNodeFocus || e.target.group() !== 'nodes') return
      focusElement(e.target)
    })

    if (this.props.onGraphRender) this.props.onGraphRender()
  }

  async _getGraphNodes (cid, nodeMap = new Map()) {
    if (nodeMap.get(cid)) return

    const ipfs = await getIpfs()
    const { value: source } = await ipfs.dag.get(cid)
    const classes = []
    let nodeData = {}

    if (DAGNode.isDAGNode(source)) {
      try {
        // it's a unix system?
        const unixfsData = UnixFs.unmarshal(source.Data)
        nodeData = {
          type: 'unixfs',
          isLeaf: Boolean(source.Links.length),
          length: (await ipfs.block.get(cid)).data.length,
          unixfsData
        }
      } catch (err) {
        // dag-pb but not a unixfs.
        console.log(err)
      }

      for (let i = 0; i < source.Links.length; i++) {
        await this._getGraphNodes(source.Links[i].Hash.toString(), nodeMap)
      }

      if (!source.Links.length) classes.push('leaf')
      if (nodeData) classes.push('unixfs', nodeData.unixfsData.type)
    } else if (Buffer.isBuffer(source)) {
      classes.push('raw')
      nodeData = { type: 'raw', isLeaf: true, length: source.length }
    } else {
      // TODO: What IPLD node is this? How to extract the links?
      classes.push('leaf')
      nodeData = { type: 'unknown', isLeaf: true }
    }

    nodeMap.set(cid, {
      group: 'nodes',
      data: { id: cid, ...nodeData },
      classes
    })

    ;(source.Links || []).forEach(link => {
      nodeMap.set(cid + '->' + link.Hash, {
        group: 'edges',
        data: { source: cid, target: link.Hash.toString() }
      })
    })

    return nodeMap
  }

  render () {
    return <div ref={this._graphRoot} className='bg-snow-muted h-100' />
  }
}

Blocks.propTypes = {
  numObjects: PropTypes.number,
  pins: PropTypes.array
}
