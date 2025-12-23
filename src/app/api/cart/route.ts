import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/cart";
import { Menu } from "@/models/menu";

function isValidObjectId(id?: string | null) {
	return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const idUser = url.searchParams.get("idUser");

		if (!isValidObjectId(idUser)) {
			return NextResponse.json({ success: false, error: "Invalid or missing idUser" }, { status: 400 });
		}

		const start = Date.now();
		await connectDB();
		const connectedAt = Date.now();

		let cart = await Cart.findOne({ idUser }).populate({
			path: 'items.idProduct',
			model: 'Menu',
			select: 'name price pic'
		});
		const fetchedAt = Date.now();
		console.log(`GET /controller/cart timings (ms): connect=${connectedAt - start}, query=${fetchedAt - connectedAt}, total=${fetchedAt - start}`);

		return NextResponse.json({ success: true, cart });
	} catch (err) {
		console.error("GET /controller/cart error:", err);
		return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
	}
}

export async function POST(req: Request) {
		try {
			const body = (await req.json()) as any;
			const { idUser, idProduct, quantity, customizations } = body;

			if (!isValidObjectId(idUser) || !isValidObjectId(idProduct) || typeof quantity !== "number") {
				return NextResponse.json({ success: false, error: "Invalid input (idUser, idProduct, quantity required)" }, { status: 400 });
			}

			if (!customizations || typeof customizations !== "object") {
				return NextResponse.json({ success: false, error: "Invalid customizations" }, { status: 400 });
			}

		await connectDB();

		let cart = await Cart.findOne({ idUser });

		if (!cart) {
			cart = await Cart.create({ 
				idUser, 
				items: [{
					idProduct,
					quantity,
					sugar: customizations.sugar,
					ice: customizations.ice,
					additions: customizations.additions || []
				}] 
			});
			return NextResponse.json({ success: true, cart }, { status: 201 });
		}

		const menuExists = await Menu.exists({ _id: idProduct });
		if (!menuExists) {
			return NextResponse.json({ success: false, error: "Menu item not found" }, { status: 404 });
		}

		const existing = cart.items.find((it: any) => 
			String(it.idProduct) === String(idProduct) &&
			it.sugar === customizations.sugar &&
			it.ice === customizations.ice &&
			(!customizations.additions || customizations.additions.length === 0) &&
			(!it.additions || it.additions.length === 0)
		);

		if (existing) {
			existing.quantity = (existing.quantity || 0) + quantity;
		} else {
			cart.items.push({
				idProduct,
				quantity,
				sugar: customizations.sugar,
				ice: customizations.ice,
				additions: customizations.additions || []
			});
		}

		await cart.save();
		
		cart = await Cart.findOne({ _id: cart._id }).populate({
			path: 'items.idProduct',
			model: 'Menu',
			select: 'name price pic'
		});

		return NextResponse.json({ success: true, cart });
	} catch (err) {
		console.error("POST /controller/cart error:", err);
		return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
		try {
			const body = (await req.json()) as any;
			const { idUser, idProduct, quantity } = body;

			if (!isValidObjectId(idUser) || !isValidObjectId(idProduct) || typeof quantity !== "number") {
				return NextResponse.json({ success: false, error: "Invalid input (idUser, idProduct, quantity required)" }, { status: 400 });
			}

		await connectDB();

		let cart = await Cart.findOne({ idUser });
		if (!cart) return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 });

		const idx = cart.items.findIndex((it: any) => String(it.idProduct) === String(idProduct));
		if (idx === -1) return NextResponse.json({ success: false, error: "Product not in cart" }, { status: 404 });

		if (quantity <= 0) {
			cart.items.splice(idx, 1);
		} else {
			cart.items[idx].quantity = quantity;
		}

		await cart.save();

		cart = await Cart.findOne({ _id: cart._id }).populate({
			path: 'items.idProduct',
			model: 'Menu',
			select: 'name price pic'
		});

		return NextResponse.json({ success: true, cart });
	} catch (err) {
		console.error("PUT /controller/cart error:", err);
		return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
		try {
			const body = (await req.json().catch(() => ({}))) as any;
			const { idUser, idProduct, deleteCart } = body;

			if (!isValidObjectId(idUser)) {
				return NextResponse.json({ success: false, error: "Invalid or missing idUser" }, { status: 400 });
			}

		await connectDB();

		if (deleteCart) {
			await Cart.deleteOne({ idUser });
			return NextResponse.json({ success: true, message: "Cart deleted" });
		}

		if (!isValidObjectId(idProduct)) {
			return NextResponse.json({ success: false, error: "Invalid or missing idProduct" }, { status: 400 });
		}

		let cart = await Cart.findOne({ idUser });
		if (!cart) return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 });

		cart.items = cart.items.filter((it: any) => String(it.idProduct) !== String(idProduct));
		await cart.save();

		cart = await Cart.findOne({ _id: cart._id }).populate({
			path: 'items.idProduct',
			model: 'Menu',
			select: 'name price pic'
		});

		return NextResponse.json({ success: true, cart });
	} catch (err) {
		console.error("DELETE /controller/cart error:", err);
		return NextResponse.json({ success: false, error: "Failed to delete from cart" }, { status: 500 });
	}
}   