import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/cart";
import { Menu } from "@/models/menu";

function isHexObjectId(id?: string | null) {
	return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

export async function GET(req: Request) {
	try {
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("session")?.value;

		if (!sessionId || !isHexObjectId(sessionId)) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(req.url);
		const idUser = url.searchParams.get("idUser");

		if (!isHexObjectId(idUser)) {
			return NextResponse.json({ success: false, error: "Invalid or missing idUser" }, { status: 400 });
		}

		console.log("GET /controller/cart - Using Mongoose");
		await connectDB();

		let cart = await Cart.findOne({ idUser }).populate({
			path: 'items.idProduct',
			model: 'Menu',
			select: 'name price pic'
		});

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

		if (!isHexObjectId(idUser) || !isHexObjectId(idProduct) || typeof quantity !== "number") {
			return NextResponse.json({ success: false, error: "Invalid input (idUser, idProduct, quantity required)" }, { status: 400 });
		}

		if (!customizations || typeof customizations !== "object") {
			return NextResponse.json({ success: false, error: "Invalid customizations" }, { status: 400 });
		}

		console.log("POST /controller/cart - Using Mongoose");
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

		const existing = cart.items.find((it: any) => {
			const basicMatch = String(it.idProduct) === String(idProduct) &&
				it.sugar === customizations.sugar &&
				it.ice === customizations.ice;

			if (!basicMatch) return false;

			const itemAdditions = it.additions || [];
			const newAdditions = customizations.additions || [];

			if (itemAdditions.length !== newAdditions.length) return false;

			const sortedItemAdditions = [...itemAdditions].sort();
			const sortedNewAdditions = [...newAdditions].sort();

			return sortedItemAdditions.every((addition, index) => addition === sortedNewAdditions[index]);
		});

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
		const { idUser, idProduct, quantity, customizations } = body;

		if (!isHexObjectId(idUser) || !isHexObjectId(idProduct) || typeof quantity !== "number") {
			return NextResponse.json({ success: false, error: "Invalid input (idUser, idProduct, quantity required)" }, { status: 400 });
		}

		console.log("PUT /controller/cart - Using Mongoose");
		await connectDB();

		let cart = await Cart.findOne({ idUser });
		if (!cart) return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 });

		const { sugar, ice, additions } = body.customizations || {};

		const idx = cart.items.findIndex((it: any) => {
			const basicMatch = String(it.idProduct) === String(idProduct) &&
				it.sugar === sugar &&
				it.ice === ice;

			if (!basicMatch) return false;

			const itemAdditions = it.additions || [];
			const updateAdditions = additions || [];

			if (itemAdditions.length !== updateAdditions.length) return false;

			const sortedItemAdditions = [...itemAdditions].sort();
			const sortedUpdateAdditions = [...updateAdditions].sort();

			return sortedItemAdditions.every((addition, index) => addition === sortedUpdateAdditions[index]);
		});

		if (idx === -1) return NextResponse.json({ success: false, error: "Item not found in cart" }, { status: 404 });

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
		const { idUser, idProduct, deleteCart, customizations } = body;

		if (!isHexObjectId(idUser)) {
			return NextResponse.json({ success: false, error: "Invalid or missing idUser" }, { status: 400 });
		}

		console.log("DELETE /controller/cart - Using Mongoose");
		await connectDB();

		if (deleteCart) {
			await Cart.deleteOne({ idUser });
			return NextResponse.json({ success: true, message: "Cart deleted" });
		}

		if (!isHexObjectId(idProduct)) {
			return NextResponse.json({ success: false, error: "Invalid or missing idProduct" }, { status: 400 });
		}

		let cart = await Cart.findOne({ idUser });
		if (!cart) return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 });

		const { sugar, ice, additions } = customizations || {};

		if (Object.keys(customizations || {}).length > 0) {
			cart.items = cart.items.filter((it: any) => {
				const basicMatch = String(it.idProduct) !== String(idProduct) ||
					it.sugar !== sugar ||
					it.ice !== ice;

				if (basicMatch) return true;

				const itemAdditions = it.additions || [];
				const deleteAdditions = additions || [];

				if (itemAdditions.length !== deleteAdditions.length) return true;

				const sortedItemAdditions = [...itemAdditions].sort();
				const sortedDeleteAdditions = [...deleteAdditions].sort();

				return !sortedItemAdditions.every((addition, index) => addition === sortedDeleteAdditions[index]);
			});
		} else {
			cart.items = cart.items.filter((it: any) => String(it.idProduct) !== String(idProduct));
		}

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
