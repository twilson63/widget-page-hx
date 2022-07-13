import format from 'date-fns/format'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443
})

const warp = window.warp.WarpWebFactory.memCached(arweave)

export async function pageHistory(txId) {
	const { state } = await warp.contract(txId).readState()
  const result = await arweave.api.post('graphql', { query: historyQuery(state.owner, state.title)})
  
  return formatData(result.data)
}


function formatData({ data }) {
  return data.transactions.edges.map(({node}) => {
    function getTag(tagName) {
      return node.tags.find(tag => tag.name === tagName)?.value
    }

    return {
      webpage: getTag('Webpage'),
      status: getTag('Status') || 'webpage published!',
      timestamp: format(new Date(getTag('Timestamp')), 'M/dd/yyyy h:mm a')
    }
     
  })
}

function historyQuery(owner, title) {
  return `
query {
  transactions(
    first: 100, 
    owners: ["${owner}"], 
    tags: [
      {name: "Content-Type", values: ["application/json"]},
      {name: "App-Name", values: ["PermaPages"]},
      {name: "Page-Title", values: ["${title}"]}
    ]
  ) {
    edges {
      node {
        id
        tags {
          name 
          value
        }
      }
    }
  }
}
  `
}
