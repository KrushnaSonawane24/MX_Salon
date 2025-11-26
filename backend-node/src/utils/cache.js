let client = null

async function connectCache(){
  const url = process.env.REDIS_URL
  if(!url) throw new Error('REDIS_URL not set')
  // Placeholder: demonstrate where Redis client would be created.
  // For production, use: import('redis').then(({ createClient }) => ...)
  client = { url }
  return client
}

function getCache(){
  return client
}

module.exports = { connectCache, cache: { get: getCache } }
