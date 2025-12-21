import React, { useEffect, useState } from 'react'

const ProductList = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setProducts(json.data || [])
      } catch (err) {
        // ignore in simple component; tests mock fetch
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      {products.map((p) => (
        <div key={p._id}>
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  )
}

export default ProductList
