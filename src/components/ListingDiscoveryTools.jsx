import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, MapPin, Minus, Plus, X } from "lucide-react";

const TILE_SIZE = 256;
const UTILITY_LABELS = {
    electricity: "Electricity",
    water: "Water",
    gas: "Gas",
    internet: "Internet",
    other: "Other",
};

function getRent(listing) {
    const amount = String(listing?.price || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return amount ? Number(amount[0]) : 0;
}

function utilityEntries(listing) {
    return Object.entries(listing?.utility_costs || {})
        .filter(([, value]) => value !== null && value !== "" && Number.isFinite(Number(value)))
        .map(([key, value]) => [UTILITY_LABELS[key] || key, Number(value)]);
}

function formatBDT(value) {
    return `BDT ${Math.round(value).toLocaleString("en-BD")}`;
}

function toWorldPixel(latitude, longitude, zoom) {
    const scale = TILE_SIZE * 2 ** zoom;
    const sin = Math.sin((latitude * Math.PI) / 180);
    return {
        x: ((longitude + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
    };
}

function fromWorldPixel(x, y, zoom) {
    const scale = TILE_SIZE * 2 ** zoom;
    const longitude = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const latitude = (180 / Math.PI) * Math.atan(Math.sinh(n));
    return [latitude, longitude];
}

function listingCoordinates(listing) {
    const latitude = Number(listing.latitude);
    const longitude = Number(listing.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
        ? [latitude, longitude]
        : null;
}

export function ListingsMap({ listings, onOpenListing }) {
    const mapRef = useRef(null);
    const dragRef = useRef(null);
    const [size, setSize] = useState({ width: 900, height: 480 });
    const [center, setCenter] = useState([23.8103, 90.4125]);
    const [zoom, setZoom] = useState(12);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const pins = useMemo(
        () => listings.map((listing) => ({ listing, coordinates: listingCoordinates(listing) })).filter((item) => item.coordinates),
        [listings]
    );
    useEffect(() => {
        if (!mapRef.current) return undefined;
        const observer = new ResizeObserver(([entry]) => {
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(mapRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!pins.length) return;
        const latitude = pins.reduce((sum, pin) => sum + pin.coordinates[0], 0) / pins.length;
        const longitude = pins.reduce((sum, pin) => sum + pin.coordinates[1], 0) / pins.length;
        setCenter([latitude, longitude]);
        setZoom(12);
    }, [pins]);

    const centerPixel = toWorldPixel(center[0], center[1], zoom);
    const tiles = useMemo(() => {
        const startX = Math.floor((centerPixel.x - size.width / 2) / TILE_SIZE);
        const endX = Math.floor((centerPixel.x + size.width / 2) / TILE_SIZE);
        const startY = Math.floor((centerPixel.y - size.height / 2) / TILE_SIZE);
        const endY = Math.floor((centerPixel.y + size.height / 2) / TILE_SIZE);
        const tileCount = 2 ** zoom;
        const result = [];
        for (let x = startX; x <= endX; x += 1) {
            for (let y = startY; y <= endY; y += 1) {
                if (y < 0 || y >= tileCount) continue;
                result.push({
                    key: `${x}-${y}-${zoom}`,
                    x: ((x % tileCount) + tileCount) % tileCount,
                    y,
                    left: x * TILE_SIZE - centerPixel.x + size.width / 2 + dragOffset.x,
                    top: y * TILE_SIZE - centerPixel.y + size.height / 2 + dragOffset.y,
                });
            }
        }
        return result;
    }, [centerPixel.x, centerPixel.y, size.width, size.height, zoom, dragOffset]);

    const startDrag = (event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { x: event.clientX, y: event.clientY };
    };

    const moveDrag = (event) => {
        if (!dragRef.current) return;
        setDragOffset({ x: event.clientX - dragRef.current.x, y: event.clientY - dragRef.current.y });
    };

    const finishDrag = (event) => {
        if (!dragRef.current) return;
        const offsetX = event.clientX - dragRef.current.x;
        const offsetY = event.clientY - dragRef.current.y;
        const pixel = toWorldPixel(center[0], center[1], zoom);
        setCenter(fromWorldPixel(pixel.x - offsetX, pixel.y - offsetY, zoom));
        setDragOffset({ x: 0, y: 0 });
        dragRef.current = null;
    };

    return (
        <section className="glass-pane overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#5C3A21]/15 px-4 py-3 sm:px-5">
                <div>
                    <h3 className="font-serif text-lg font-black text-[#2C1810]">Listing map</h3>
                    <p className="text-xs text-[#5C3A21]">{pins.length} pinned of {listings.length} results</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setZoom((value) => Math.max(3, value - 1))} aria-label="Zoom out" title="Zoom out" className="flex h-9 w-9 items-center justify-center border border-[#5C3A21]/25 bg-white text-[#2C1810] hover:bg-[#FAF3E0]"><Minus className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setZoom((value) => Math.min(18, value + 1))} aria-label="Zoom in" title="Zoom in" className="flex h-9 w-9 items-center justify-center border border-[#5C3A21]/25 bg-white text-[#2C1810] hover:bg-[#FAF3E0]"><Plus className="h-4 w-4" /></button>
                </div>
            </div>
            <div
                ref={mapRef}
                className="relative h-[420px] select-none overflow-hidden bg-[#e5e3df] sm:h-[520px]"
                style={{ touchAction: "none", cursor: dragRef.current ? "grabbing" : "grab" }}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
            >
                {tiles.map((tile) => (
                    <img
                        key={tile.key}
                        src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
                        alt=""
                        draggable="false"
                        className="pointer-events-none absolute h-64 w-64 max-w-none"
                        style={{ left: tile.left, top: tile.top }}
                    />
                ))}
                {pins.map(({ listing, coordinates }) => {
                    const point = toWorldPixel(coordinates[0], coordinates[1], zoom);
                    const left = size.width / 2 + point.x - centerPixel.x + dragOffset.x;
                    const top = size.height / 2 + point.y - centerPixel.y + dragOffset.y;
                    if (left < -24 || left > size.width + 24 || top < -38 || top > size.height + 12) return null;
                    return (
                        <button
                            key={listing.id}
                            type="button"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => onOpenListing(listing)}
                            title={`${listing.title} · ${listing.price}`}
                            aria-label={`Open ${listing.title}, ${listing.price}`}
                            className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
                            style={{ left, top }}
                        >
                            <span className="max-w-44 truncate border border-[#2C1810] bg-[#FAF3E0] px-2 py-1 text-[11px] font-bold text-[#2C1810] shadow-md">{listing.title}</span>
                            <MapPin className="h-8 w-8 fill-[#cf4d31] text-white drop-shadow-md" strokeWidth={1.8} />
                        </button>
                    );
                })}
                {!pins.length && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
                        <p className="max-w-sm border border-[#5C3A21]/20 bg-[#FAF3E0]/95 px-5 py-4 text-center text-sm text-[#5C3A21]">No results have map coordinates yet. Owners can add a latitude and longitude when creating or editing a listing.</p>
                    </div>
                )}
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="absolute bottom-1 right-1 z-20 bg-white/90 px-1.5 py-0.5 text-[10px] text-[#333]">© OpenStreetMap contributors</a>
            </div>
            {listings.length > pins.length && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#5C3A21]/15 px-4 py-2 text-xs text-[#5C3A21] sm:px-5">
                    <span>{listings.length - pins.length} without coordinates</span>
                    {listings.filter((listing) => !listingCoordinates(listing)).slice(0, 5).map((listing) => (
                        <button key={listing.id} type="button" onClick={() => onOpenListing(listing)} className="font-semibold underline underline-offset-2">{listing.title}</button>
                    ))}
                </div>
            )}
        </section>
    );
}

export function ListingComparison({ listings, onRemove, onClear }) {
    if (!listings.length) return null;
    const rows = [
        { label: "Monthly rent", value: (listing) => formatBDT(getRent(listing)) },
        { label: "Owner utility estimate", value: (listing) => utilityEntries(listing).length ? formatBDT(utilityEntries(listing).reduce((sum, [, cost]) => sum + cost, 0)) : "Not provided" },
        { label: "Estimated monthly total", value: (listing) => utilityEntries(listing).length ? formatBDT(getRent(listing) + utilityEntries(listing).reduce((sum, [, cost]) => sum + cost, 0)) : `${formatBDT(getRent(listing))} + utilities` },
        { label: "Type", value: (listing) => listing.type || "Not specified" },
        { label: "Location", value: (listing) => listing.location || "Not specified" },
        { label: "Amenities", value: (listing) => (listing.amenities || []).slice(0, 5).join(", ") || "Not listed" },
    ];
    return (
        <section className="glass-pane overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#5C3A21]/15 px-4 py-3 sm:px-5">
                <div>
                    <h3 className="font-serif text-lg font-black text-[#2C1810]">Compare homes</h3>
                    <p className="text-xs text-[#5C3A21]">Owner utility amounts are estimates; blank costs are not included in totals.</p>
                </div>
                <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#5C3A21] hover:text-[#2C1810]"><X className="h-4 w-4" />Clear</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead>
                        <tr>
                            <th className="w-40 border-b border-r border-[#5C3A21]/15 px-4 py-3 text-xs uppercase text-[#A89880]">Details</th>
                            {listings.map((listing) => (
                                <th key={listing.id} className="min-w-48 border-b border-[#5C3A21]/15 px-4 py-3 align-top">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-serif font-black text-[#2C1810]">{listing.title}</p>
                                            <p className="mt-1 text-xs font-normal text-[#5C3A21]">{listing.location}</p>
                                        </div>
                                        <button type="button" onClick={() => onRemove(listing.id)} aria-label={`Remove ${listing.title} from comparison`} title="Remove from comparison" className="p-1 text-[#5C3A21] hover:text-[#bd3e2d]"><X className="h-4 w-4" /></button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label}>
                                <th className="border-b border-r border-[#5C3A21]/10 px-4 py-3 text-xs font-bold text-[#5C3A21]">{row.label}</th>
                                {listings.map((listing) => <td key={listing.id} className="border-b border-[#5C3A21]/10 px-4 py-3 text-[#2C1810]">{row.value(listing)}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export function RentCalculator({ listings, selectedListingId, onSelectListing }) {
    const [occupants, setOccupants] = useState("1");
    const [otherCosts, setOtherCosts] = useState("0");
    const [advanceMonths, setAdvanceMonths] = useState("1");
    const listing = listings.find((item) => String(item.id) === String(selectedListingId));
    const rent = getRent(listing);
    const utilities = utilityEntries(listing);
    const utilityTotal = utilities.reduce((sum, [, cost]) => sum + cost, 0);
    const monthlyTotal = rent + utilityTotal + (Number(otherCosts) || 0);
    const shares = Math.max(1, Number(occupants) || 1);
    const upfront = rent * Math.max(1, Number(advanceMonths) || 1) + utilityTotal + (Number(otherCosts) || 0);

    return (
        <section className="glass-pane rounded-2xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center border border-[#5C3A21]/20 bg-[#FAF3E0] text-[#5C3A21]"><Calculator className="h-4 w-4" /></span>
                <div>
                    <h3 className="font-serif text-lg font-black text-[#2C1810]">Monthly rent calculator</h3>
                    <p className="text-xs text-[#5C3A21]">Combines listing rent with owner-provided utility estimates.</p>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="sm:col-span-2 lg:col-span-4">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5C3A21]">Listing</span>
                    <select value={selectedListingId} onChange={(event) => onSelectListing(event.target.value)} className="w-full border border-[#5C3A21]/25 bg-white px-3 py-2.5 text-sm text-[#2C1810] outline-none focus:border-[#2C1810]">
                        {!listings.length && <option value="">No listings available</option>}
                        {listings.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.location} · {item.price}</option>)}
                    </select>
                </label>
                <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5C3A21]">People sharing</span>
                    <input type="number" min="1" step="1" value={occupants} onChange={(event) => setOccupants(event.target.value)} className="w-full border border-[#5C3A21]/25 bg-white px-3 py-2.5 text-sm text-[#2C1810] outline-none focus:border-[#2C1810]" />
                </label>
                <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5C3A21]">Other monthly costs</span>
                    <input type="number" min="0" step="100" value={otherCosts} onChange={(event) => setOtherCosts(event.target.value)} className="w-full border border-[#5C3A21]/25 bg-white px-3 py-2.5 text-sm text-[#2C1810] outline-none focus:border-[#2C1810]" />
                </label>
                <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5C3A21]">Advance rent months</span>
                    <input type="number" min="1" step="1" value={advanceMonths} onChange={(event) => setAdvanceMonths(event.target.value)} className="w-full border border-[#5C3A21]/25 bg-white px-3 py-2.5 text-sm text-[#2C1810] outline-none focus:border-[#2C1810]" />
                </label>
                <div className="border-l-2 border-[#d05d3e] pl-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#5C3A21]">Monthly total</p>
                    <p className="mt-1 font-serif text-xl font-black text-[#2C1810]">{formatBDT(monthlyTotal)}</p>
                    <p className="mt-1 text-xs text-[#5C3A21]">{formatBDT(monthlyTotal / shares)} per person</p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-[#5C3A21]/15 pt-3 text-xs text-[#5C3A21]">
                <p>Rent {formatBDT(rent)} + utilities {utilities.length ? formatBDT(utilityTotal) : "not provided"} + other {formatBDT(Number(otherCosts) || 0)}</p>
                <p>Estimated move-in amount: <strong className="text-[#2C1810]">{formatBDT(upfront)}</strong></p>
            </div>
            {utilities.length > 0 && <p className="mt-2 text-[11px] text-[#A89880]">Owner estimates: {utilities.map(([label, cost]) => `${label} ${formatBDT(cost)}`).join(" · ")}</p>}
        </section>
    );
}