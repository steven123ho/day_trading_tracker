'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Upload } from 'lucide-react'

interface TradeImage {
  id: string
  url: string
  caption: string | null
}

interface TradeImageUploadProps {
  tradeId: string
}

export default function TradeImageUpload({ tradeId }: TradeImageUploadProps) {
  const supabase = createClient()
  const [images, setImages] = useState<TradeImage[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  async function loadImages() {
    const { data } = await supabase.from('trade_images').select('id, url, caption').eq('trade_id', tradeId)
    setImages((data as TradeImage[]) || [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const ext = file.name.split('.').pop()
    const path = `${user.user.id}/${tradeId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('trade-images').upload(path, file)
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrl } = supabase.storage.from('trade-images').getPublicUrl(path)

    await supabase.from('trade_images').insert({
      trade_id: tradeId,
      user_id: user.user.id,
      storage_path: path,
      url: publicUrl.publicUrl,
    })

    loadImages()
    setUploading(false)
  }

  async function deleteImage(image: TradeImage) {
    if (!confirm('Delete this image?')) return
    const { data: imageData } = await supabase.from('trade_images').select('storage_path').eq('id', image.id).single()
    if (imageData) {
      await supabase.storage.from('trade-images').remove([(imageData as any).storage_path])
    }
    await supabase.from('trade_images').delete().eq('id', image.id)
    loadImages()
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
      <h2 className="text-xl font-bold text-white">Images & Screenshots</h2>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg cursor-pointer transition disabled:opacity-50">
          <Upload size={18} />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group rounded-lg overflow-hidden border border-border">
            <img src={image.url} alt="Trade screenshot" className="w-full h-48 object-cover" />
            <button
              onClick={() => deleteImage(image)}
              className="absolute top-2 right-2 p-1 bg-red-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && <p className="text-muted text-sm">No images attached yet.</p>}
    </div>
  )
}
