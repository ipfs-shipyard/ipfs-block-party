const nodeSize = '30px'

export default {
  autoungrabify: true,
  layout: {
    name: 'grid',
    condense: true,
    fit: true,
    padding: 10
  },
  style: [
    {
      selector: 'node',
      style: {
        shape: 'square',
        width: nodeSize,
        height: nodeSize,
        'background-color': '#28CA9F'
      }
    },
    {
      selector: '.unpinned',
      style: {
        shape: 'square',
        width: nodeSize,
        height: nodeSize,
        'background-color': '#b7bbc8'
      }
    },
    {
      selector: '[type = "recursive"]',
      style: {
        shape: 'square',
        width: nodeSize,
        height: nodeSize,
        'background-color': '#ea5037'
      }
    },
    {
      selector: '.leaf',
      style: {
        shape: 'square',
        width: nodeSize,
        height: nodeSize,
        'background-color': '#28CA9F'
      }
    },
    {
      selector: '.raw',
      style: {
        shape: 'square',
        width: nodeSize,
        height: nodeSize,
        'background-color': '#ea5037'
      }
    },
    {
      selector: '.unixfs.directory',
      style: {
        shape: 'round-rectangle',
        'background-color': '#34373f'
      }
    },
    {
      selector: '.unixfs.hamt-sharded-directory',
      style: {
        shape: 'round-rectangle',
        'background-color': '#34373f'
      }
    },
    {
      selector: '.unixfs.raw',
      style: {
        shape: 'square',
        width: nodeSize,
        height: nodeSize,
        'background-color': '#f39021'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 1,
        'opacity': 0,
        'line-color': 'rgb(151,151,151)',
        'line-style': 'dotted'
      }
    },
    {
      selector: '.focused',
      style: {
        'border-width': '1px',
        'border-color': '#f39021'
      }
    }
  ]
}
