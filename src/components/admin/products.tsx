"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Coffee,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Pencil,
  Save,
  UploadCloud,
  FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { Product, getStatusBadge, getCategoryColor, getStatusIcon } from "./types"
import { Dispatch, SetStateAction } from "react"

interface ProductsContentProps {
  products: Product[]
  setProducts: Dispatch<SetStateAction<Product[]>>
}

export default function ProductsContent({ products, setProducts }: ProductsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  // --- STATE UNTUK MODAL EDIT & VIEW ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // --- STATE UNTUK MODAL ADD NEW ---
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    category: "Coffee",
    price: 0,
    status: "Active",
    description: "",
    image: ""
  })

  // Logic Filter Products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Product Handlers
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const handleOpenView = (product: Product) => {
    setSelectedProduct(product)
    setIsViewOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct({ ...product })
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedProduct) return
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? selectedProduct : p))
    setIsEditOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setNewProduct({ ...newProduct, image: imageUrl })
    }
  }

  const handleAddProduct = () => {
    const id = (products.length + 1).toString()
    const productToAdd: Product = {
      id,
      name: newProduct.name || "New Product",
      category: newProduct.category || "Coffee",
      price: newProduct.price || 0,
      status: newProduct.status || "Active",
      sales: 0, 
      description: newProduct.description || "",
      image: newProduct.image || ""
    }

    setProducts([...products, productToAdd])
    setIsAddOpen(false)
    setNewProduct({ name: "", category: "Coffee", price: 0, status: "Active", description: "", image: "" })
  }

  return (
    <motion.div
        key="products"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
    >
        <TabsContent value="products" className="mt-0">
            <Card className="shadow-sm border-none ring-1 ring-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>Manage your coffee menu inventory.</CardDescription>
                </div>
                
                <Button 
                size="sm" 
                className="gap-1 shadow-sm bg-green-500 text-primary-foreground hover:bg-green-600"
                onClick={() => setIsAddOpen(true)}
                >
                <Plus className="h-3.5 w-3.5" /> Add Product
                </Button>

            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-6 gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                </div>
                <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                        <TableCell>
                            <div className="h-10 w-10 rounded-md bg-slate-100 overflow-hidden relative border border-slate-200 grid place-items-center">
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Coffee className="h-5 w-5 text-gray-400" />
                            )}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{product.category}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`${getStatusBadge(product.status)} border`}>
                            {product.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 shadow-lg border border-gray-100">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenView(product)} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4 text-blue-500" /> 
                                    <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEdit(product)} className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4 text-amber-500" /> 
                                    <span>Edit Product</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> 
                                    <span>Delete Item</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>

            {/* ======================================================================= */}
            {/* MODALS AREA (PRODUCT ONLY)                              */}
            {/* ======================================================================= */}

            {/* 1. VIEW DETAILS DIALOG */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-xl bg-white">
                
                {/* Header Title */}
                <div className="px-8 py-6 border-b border-gray-100">
                    <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">Product Details</DialogTitle>
                </div>

                {selectedProduct && (
                    <div className="flex flex-col gap-8 px-8 py-2">
                    
                    {/* Bagian Atas: Foto Bulat & Detail Utama */}
                    <div className="flex flex-row gap-8 items-start">
                        
                        {/* Foto Lingkaran Besar */}
                        <div className="h-36 w-36 shrink-0 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative shadow-sm">
                        {selectedProduct.image ? (
                            <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name} 
                            className="h-full w-full object-cover"
                            />
                        ) : (
                            <Coffee className="h-14 w-14 text-slate-300" />
                        )}
                        </div>

                        {/* Kolom Kanan: Informasi */}
                        <div className="flex flex-col gap-4 pt-2 w-full">
                        
                        {/* Nama & Kategori (Berwarna Beda) */}
                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Name</span>
                            <div className="flex items-center gap-3">
                            <p className="text-xl font-bold text-gray-900">{selectedProduct.name}</p>
                            
                            {/* UPDATE: Category tanpa hover */}
                            <Badge variant="secondary" className={`rounded-md font-medium px-2.5 pointer-events-none ${getCategoryColor(selectedProduct.category)}`}>
                                {selectedProduct.category}
                            </Badge>

                            </div>
                        </div>

                        {/* Harga */}
                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</span>
                            <p className="text-2xl font-bold">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(selectedProduct.price)}
                            </p>
                        </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Bagian Bawah: Deskripsi & Status */}
                    <div className="flex flex-row justify-between items-end">
                        
                        {/* Deskripsi */}
                        <div className="space-y-2 max-w-[60%]">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" /> Description
                        </span>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedProduct.description || "No description available for this product."}
                        </p>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                        
                        {/* UPDATE: Status dengan Icon dan Tanpa Hover */}
                        <Badge variant="outline" className={`px-3 py-1 gap-1.5 pointer-events-none ${getStatusBadge(selectedProduct.status)}`}>
                            {getStatusIcon(selectedProduct.status)}
                            {selectedProduct.status}
                        </Badge>
                        </div>
                    </div>

                    </div>
                )}
                
                {/* Footer */}
                <DialogFooter className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                    <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
                    <Button onClick={() => { setIsViewOpen(false); setIsEditOpen(true); }} className="gap-1 shadow-sm bg-green-500 text-primary-foreground hover:bg-green-600">
                    <Pencil className="h-3.5 w-3.5" /> Edit Details
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. EDIT PRODUCT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>Update details for {selectedProduct?.name}. Click save when you're done.</DialogDescription>
                </DialogHeader>
                
                {selectedProduct && (
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                        <Input 
                        id="edit-name" 
                        value={selectedProduct.name} 
                        onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                        className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-price" className="text-right">Price</Label>
                        <Input 
                        id="edit-price" 
                        type="number" 
                        value={selectedProduct.price} 
                        onChange={(e) => setSelectedProduct({...selectedProduct, price: Number(e.target.value)})}
                        className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-category" className="text-right">Category</Label>
                        <Select 
                            value={selectedProduct.category} 
                            onValueChange={(val) => setSelectedProduct({...selectedProduct, category: val})}
                        >
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Coffee">Coffee</SelectItem>
                            <SelectItem value="Non-Coffee">Non-Coffee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-status" className="text-right">Status</Label>
                        <Select 
                            value={selectedProduct.status} 
                            onValueChange={(val) => setSelectedProduct({...selectedProduct, status: val})}
                        >
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Disabled">Disabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600 text-white">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 3. ADD NEW PRODUCT DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[550px] bg-white">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                    Create a new item for your menu. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-5 py-4">
                    
                    {/* Image Upload Area (BROWSE MODE) */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-2">
                        <label 
                        htmlFor="image-upload" 
                        className="cursor-pointer group relative h-24 w-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden hover:border-primary hover:text-primary transition-colors"
                        >
                        {newProduct.image ? (
                            <img src={newProduct.image} className="h-full w-full object-cover" alt="Preview" />
                        ) : (
                            <UploadCloud className="h-8 w-8" />
                        )}
                        {/* Overlay effect */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-[10px] font-medium text-white bg-black/50 px-2 py-1 rounded">Change</p>
                        </div>
                        </label>
                        
                        <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleImageUpload}
                        />
                        <p className="text-xs text-muted-foreground">Click to browse image</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-name">Product Name</Label>
                            <Input 
                            id="add-name" 
                            placeholder="e.g. Vanilla Latte" 
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-price">Price (IDR)</Label>
                            <Input 
                            id="add-price" 
                            type="number" 
                            placeholder="0" 
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-category">Category</Label>
                            <Select 
                                value={newProduct.category} 
                                onValueChange={(val) => setNewProduct({...newProduct, category: val})}
                            >
                                <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="Coffee">Coffee</SelectItem>
                                <SelectItem value="Non-Coffee">Non-Coffee</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-status">Status</Label>
                            <Select 
                                value={newProduct.status} 
                                onValueChange={(val) => setNewProduct({...newProduct, status: val})}
                            >
                                <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="add-desc">Description</Label>
                        <Textarea 
                        id="add-desc" 
                        placeholder="Describe your product..." 
                        className="resize-none"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddProduct} className=" bg-green-500 text-primary-foreground hover:bg-green-600">
                    Save Product
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </TabsContent>
    </motion.div>
  )
}