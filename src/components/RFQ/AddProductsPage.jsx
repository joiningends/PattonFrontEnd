import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../../axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    CirclePlusIcon,
    Check,
    AlertCircle,
    X,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Flashlight,
    EyeIcon
} from "lucide-react";
import Select from 'react-select';
import useAppStore from "../../zustandStore";
import { Tooltip } from 'react-tooltip'

export default function AddProductPage() {

    const navigate = useNavigate();
    const { rfqId } = useParams();
    const [sku, setSku] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedSku, setSelectedSku] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const [productsPerPage] = useState(5);
    const [currency, setCurrency] = useState("INR");
    const [rawMaterial, setRawMaterial] = useState([]);
    const [isBOMmodalOpen, setIsBOMmodalOpen] = useState(false);
    const [isNonBOMmodalOpen, setIsNonBOMmodalOpen] = useState(false);

    const { role } = useAppStore();

    useEffect(() => {
        const fetchSkus = async () => {
            setIsLoading(true);

            try {

                const response = await axiosInstance.get(`/sku/getsku/${rfqId}`);

                console.log(response.data.data);

                if (response.data.success) {
                    setSku(response.data.data);
                } else {
                    setError("Failed to fetch SKU data.");
                }
            } catch (error) {
                setError("Error fetching SKU data: ", error);
            }
            setIsLoading(false);
        };

        fetchSkus();
        fetchRawMaterial();
    }, [rfqId]);

    const [newProduct, setNewProduct] = useState({
        product_id: "",
        product_name: "",
        quantity_per_assembly: "",
        raw_material_type: "",
        raw_material_type_name: "",
        yield_percentage: "",
        net_weight_of_product: "",
        bom_cost_per_kg: "",
        final_bom_cost: '',
        isFinalBOM: false,
    });

    const [validationErrors, setValidationErrors] = useState({
        product_name: "",
        quantity_per_assembly: "",
        raw_material_type: "",
        yield_percentage: "",
        net_weight_of_product: ""
        // bom_cost_per_kg: ""
    });

    const resetNewProduct = () => {
        setNewProduct({
            product_id: "",
            product_name: "",
            quantity_per_assembly: "",
            raw_material_type: "",
            raw_material_type_name: "",
            yield_percentage: "",
            net_weight_of_product: "",
            bom_cost_per_kg: "",
            final_bom_cost: "",
            isFinalBOM: false,
        });
    };


    const validateProduct = () => {
        const errors = {};
        if (!newProduct.product_name.trim())
            errors.product_name = "Product name is required";
        if (!newProduct.quantity_per_assembly)
            errors.quantity_per_assembly = "Quantity is required";
        if (!newProduct.raw_material_type)
            errors.raw_material_type = "Raw material type is required";
        if (!newProduct.yield_percentage)
            errors.yield_percentage = "Yield percentage is required";
        if (!newProduct.net_weight_of_product)
            errors.net_weight_of_product = "Net weight of product is required";
        // if (!newProduct.bom_cost_per_kg)
        //     errors.bom_cost_per_kg = "BOM cost is required";
        return errors;
    };

    const handleOpenModal = (sku) => {
        setSelectedSku(sku);
        setIsModalOpen(true);
        setIsEditMode(false);
        resetNewProduct();
    };

    const fetchRawMaterial = async () => {
        try {
            const response = await axiosInstance.get(`/rawmaterial/`);
            if (response.data.success) {
                setRawMaterial(response.data.data);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const rawMaterialOptions = rawMaterial.map(raw => ({
        value: raw.id,
        label: raw.raw_material_name,
    }));

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSku(null);
        setIsEditMode(false);
        resetNewProduct();
    };

    const handleCloseBOMmodal = () => {
        setIsBOMmodalOpen(false);
        setSelectedSku(null);
        setIsEditMode(false);
        resetNewProduct();
    }

    const handleCloseNonBOMmodal = () => {
        setIsNonBOMmodalOpen(false);
        setSelectedSku(null);
        setIsEditMode(false);
        resetNewProduct();
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));
        setValidationErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSelectChange = (selectedOption, { name }) => {
        if (name === "raw_material_type") {
            setNewProduct({
                ...newProduct,
                raw_material_type: selectedOption.value,
                raw_material_type_name: selectedOption.label,
            });
        }
        setValidationErrors({ ...validationErrors, [name]: "" });
    };



    // Update handleSaveProducts function
    const handleSaveProducts = async () => {
        const errors = validateProduct();
        if (Object.keys(errors).length === 0) {
            try {
                // Initialize products array if it doesn't exist
                const currentProducts = selectedSku.products || [];

                const updatedProducts = isEditMode
                    ? currentProducts.map((p, index) =>
                        index === editIndex ? newProduct : p
                    )
                    : [...currentProducts, newProduct];


                await saveProductsToBackend(selectedSku.sku_id, updatedProducts);


                // Update the main SKU list
                setSku(prevSku =>
                    prevSku.map(s =>
                        s.sku_id === selectedSku.sku_id
                            ? { ...s, products: updatedProducts }
                            : s
                    )
                );

                // Update the selected SKU
                setSelectedSku(prev => ({ ...prev, products: updatedProducts }));

                resetNewProduct();
                setIsEditMode(false);
                setEditIndex(null);
                setValidationErrors({});
                setSuccessMessage("Product saved successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (error) {
                setError("Failed to save product: " + error);
            }
        } else {
            setValidationErrors(errors);
        }
    };

    const handleSaveBOMProducts = async () => {
        const errors = validateBOMProduct();
        console.log("Error: ", errors);

        console.log(Object.keys(errors).length);
        if (Object.keys(errors).length === 0) {
            try {

                // const currentProducts = selectedSku.products || [];

                // Get current products (only those with is_bom=true)
                const currentBOMProducts = (selectedSku.products || []).filter(p => p.is_bom === true);

                const updatedProducts = isEditMode
                    ? currentBOMProducts.map((p, index) =>
                        index === editIndex ? { ...newProduct, is_bom: true } : p
                    )
                    : [...currentBOMProducts, { ...newProduct, is_bom: true }];

                console.log("Updated Products: ", updatedProducts);

                const success = await saveBOMProductsToBackend(selectedSku.sku_id, updatedProducts);

                if (success) {
                    // Update the main SKU list
                    setSku(prevSku =>
                        prevSku.map(s =>
                            s.sku_id === selectedSku.sku_id
                                ? { ...s, products: updatedProducts }
                                : s
                        )
                    );

                    // Update the selected SKU
                    setSelectedSku(prev => ({ ...prev, products: updatedProducts }));

                    resetNewProduct();
                    setIsEditMode(false);
                    setEditIndex(null);
                    setValidationErrors({});
                    setSuccessMessage("BOM Product saved successfully!");
                    setCurrentProductPage(1);
                    setTimeout(() => setSuccessMessage(""), 3000);
                }
            } catch (error) {
                setError("Failed to save BOM product: " + error);
            }
        } else {
            setValidationErrors(errors);
        }
    };

    const validateBOMProduct = () => {
        const errors = {};

        if (!newProduct.product_name.trim()) {
            errors.product_name = "Product name is required";
        }

        if (!newProduct.isFinalBOM) {
            if (!newProduct.quantity_per_assembly) {
                errors.quantity_per_assembly = "Quantity is required";
            }
            if (!newProduct.net_weight_of_product) {
                errors.net_weight_of_product = "Net weight of product is required";
            }
        } else {
            if (!newProduct.final_bom_cost) {
                errors.final_bom_cost = "Final BOM cost is required";
            }
        }

        return errors;
    };

    const handleEditProduct = (skuId, productIndex) => {
        const skuToEdit = sku.find(s => s.sku_id === skuId);
        if (skuToEdit && skuToEdit.products?.[productIndex]) {
            setSelectedSku(skuToEdit);
            // if (skuToEdit.products && skuToEdit.products[productIndex]) {
            const productToEdit = skuToEdit.products[productIndex];
            setNewProduct({
                ...productToEdit,
                // Make sure the raw material is properly set in the select
                raw_material_type: productToEdit.raw_material_type,
                raw_material_type_name: productToEdit.raw_material_type_name,
                isFinalBOM: !!productToEdit.final_bom_cost
            });
            setIsEditMode(true);
            setEditIndex(productIndex);
            // }
        }
    };


    const handleAddProductDetails = (sku) => {
        setSelectedSku(sku);
        setIsModalOpen(true);
        setIsEditMode(false);
        setEditIndex(null);
        resetNewProduct();
        setCurrentProductPage(1);
    };

    const handleProductDetails = (sku) => {
        console.log(sku);
        setSelectedSku(sku);
        setIsNonBOMmodalOpen(true);
        setIsEditMode(false);
        setEditIndex(null);
        resetNewProduct();
        setCurrentProductPage(1);
    };

    const handleAddBOMProductDetails = (sku) => {
        setSelectedSku(sku);
        setIsBOMmodalOpen(true);
        setIsEditMode(false);
        setEditIndex(null);
        resetNewProduct();
        setCurrentProductPage(1);
    };

    const handleRemoveProduct = async (skuId, productIndex) => {

        console.log("skuId: ", skuId);
        console.log("productId: ", productIndex);
        const skuToEdit = sku.find(s => s.sku_id === skuId);
        if (skuToEdit && skuToEdit.products?.[productIndex]) {
            // const productToDelete = skuToEdit.products[productIndex];

            const allProducts = skuToEdit.products;
            const productToDelete = allProducts[productIndex];

            try {
                // Call the delete API
                const response = await axiosInstance.delete(
                    `/sku/deleteproduct/${productToDelete.product_id}`
                );

                if (response.data.success) {
                    // Update the local state to remove the product
                    const updatedProducts = skuToEdit.products.filter(
                        (_, index) => index !== productIndex
                    );

                    // Update the main SKU list
                    setSku(prevSku =>
                        prevSku.map(sku =>
                            sku.sku_id === skuId
                                ? { ...sku, products: updatedProducts }
                                : sku
                        )
                    );

                    // Update the selected SKU if it's the current one
                    if (selectedSku?.sku_id === skuId) {
                        setSelectedSku(prev => ({ ...prev, products: updatedProducts }));
                    }

                    setSuccessMessage("Product deleted successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                } else {
                    setError("Failed to delete product: " + (response.data.message || "Unknown error"));
                }
            } catch (error) {
                setError("Failed to delete product: " +
                    (error.response?.data?.message || error.message));
            }
        }
    };

    const handleProductPageChange = (page) => {
        setCurrentProductPage(page);
    };

    const saveProductsToBackend = async (skuId, products) => {
        try {
            const response = await axiosInstance.post(`/sku/saveproducts/`, {
                p_sku_id: skuId,
                p_products: products,
            });
            console.log(response.data.data);
            if (response.data.success) {
                setSku(prevSkuData =>
                    prevSkuData.map(sku =>
                        sku.sku_id === skuId ? { ...sku, products: products } : sku
                    )
                );
                setSuccessMessage(
                    response.data.message || "Products updated successfully"
                );
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setError("Failed to save products");
            }
        } catch (error) {
            setError(
                "Error saving products: " +
                (error.response?.data?.message || error.message)
            );
        }
    };

    const saveBOMProductsToBackend = async (skuId, products) => {
        try {
            const response = await axiosInstance.post(`/sku/save-bomproducts/`, {
                p_sku_id: skuId,
                p_bom_products: products.map(product => ({
                    product_name: product.product_name,
                    quantity_per_assembly: product.quantity_per_assembly || null,
                    raw_material_type: product.raw_material_type || null,
                    yield_percentage: product.yield_percentage || null,
                    net_weight_of_product: product.net_weight_of_product || null,
                    bom_cost_per_kg: product.bom_cost_per_kg || null,
                    final_bom_cost: product.final_bom_cost || null,
                    isFinalBOM: product.isFinalBOM || null,
                    is_bom: true
                }))
            });
            console.log(response.data.data);
            if (response.data.success) {
                setSku(prevSkuData =>
                    prevSkuData.map(sku =>
                        sku.sku_id === skuId ? { ...sku, products: products } : sku
                    )
                );
                setSuccessMessage(
                    response.data.message || "Products updated successfully"
                );
                setTimeout(() => setSuccessMessage(""), 3000);
                return true;
            } else {
                setError("Failed to save products");
                return false;
            }
        } catch (error) {
            setError(
                "Error saving products: " +
                (error.response?.data?.message || error.message)
            );
            return false;
        }
    };

    // Calculate pagination variables
    const totalProductPages = selectedSku?.products
        ? Math.ceil(selectedSku.products.length / productsPerPage)
        : 0;

    const totalBomProductPages = selectedSku?.products
        ? Math.ceil(
            selectedSku.products.filter(p => p.is_bom === true).length /
            productsPerPage
        )
        : 0;

    const totalNonBomProductPages = selectedSku?.products
        ? Math.ceil(
            selectedSku.products.filter(p => p.is_bom === false).length /
            productsPerPage
        )
        : 0;

    const currentProducts = selectedSku?.products
        ? selectedSku.products.slice(
            (currentProductPage - 1) * productsPerPage,
            currentProductPage * productsPerPage
        )
        : [];


    const currentBomProductsList = selectedSku?.products
        ? selectedSku.products
            .filter(p => p.is_bom === true)
            .slice(
                (currentProductPage - 1) * productsPerPage,
                currentProductPage * productsPerPage
            )
        : [];

    const currentNonBomProductsList = selectedSku?.products
        ? selectedSku.products
            .filter(p => p.is_bom === false)
            .slice(
                (currentProductPage - 1) * productsPerPage,
                currentProductPage * productsPerPage
            )
        : [];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#e1e1f5] to-[#f0f0f9] min-h-screen p-4 lg:p-8"
            >

                <AnimatePresence>
                    {showAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${alertMessage.type === "success" ? "bg-green-100" : "bg-yellow-100"
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                {alertMessage.type === "success" ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                                <span
                                    className={`text-sm ${alertMessage.type === "success"
                                        ? "text-green-700"
                                        : "text-yellow-700"
                                        }`}
                                >
                                    {alertMessage.message}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                <header className="mb-8">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6"
                    >
                        <div>
                            <button
                                onClick={() => navigate("/")}
                                className="text-[#000060] hover:text-[#0000a0] transition-colors flex items-center mb-4"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to RFQ List
                            </button>
                            <h1 className="text-3xl lg:text-4xl font-bold text-[#000060] mb-2">
                                SKU List
                            </h1>
                            <p className="text-[#4b4b80] text-base lg:text-lg">
                                List of SKU allocated to RFQ
                            </p>
                        </div>
                        {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="w-full lg:w-auto bg-gradient-to-r from-[#000060] to-[#0000a0] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
                    >
                        <ChevronLeft className="inline-block mr-2 h-5 w-5" />
                        Back
                    </motion.button> */}
                    </motion.div>
                </header>


                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white rounded-xl shadow-xl p-6 space-y-8"
                >

                    {sku && (
                        <div className="bg-[#f8f8fd] rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-[#000060] mb-4">SKU List</h2>
                            <SKUTable
                                skus={sku}
                                onAddProduct={role.role_id === 21 ? handleAddBOMProductDetails : handleAddProductDetails}
                                onViewProduct={handleProductDetails}
                            />
                        </div>
                    )}

                </motion.div>

                <AnimatePresence className="top-0">
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            >
                                {successMessage && (
                                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                                        {successMessage}
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#000060]">
                                        Products for {selectedSku?.sku_name}
                                    </h2>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-[#000060] hover:text-[#0000a0]"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-semibold text-[#000060] mb-4">
                                    {isEditMode ? "Edit Product" : "Add New Product"}
                                </h3>
                                <form
                                    onSubmit={e => e.preventDefault()}
                                    className="space-y-4 mb-6"
                                >
                                    <div>
                                        <label
                                            htmlFor="product_name"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            id="product_name"
                                            name="product_name"
                                            value={newProduct.product_name}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                            placeholder="Enter product name"
                                        />
                                        {validationErrors.product_name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.product_name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="quantity_per_assembly"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            Quantity per Assembly
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity_per_assembly"
                                            name="quantity_per_assembly"
                                            value={newProduct.quantity_per_assembly}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                            placeholder="Enter quantity"
                                        />
                                        {validationErrors.quantity_per_assembly && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.quantity_per_assembly}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="raw_material_type"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            Raw Material Type
                                        </label>

                                        <Select
                                            id="raw_material_type"
                                            name="raw_material_type"
                                            options={rawMaterialOptions}
                                            value={rawMaterialOptions.find(option => option.value === newProduct?.raw_material_type)}
                                            onChange={option =>
                                                handleSelectChange(option, { name: "raw_material_type" })
                                            }
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select raw material type"
                                        />
                                        {validationErrors.raw_material_type && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.raw_material_type}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="yield_percentage"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            Yield Percentage
                                        </label>
                                        <input
                                            type="number"
                                            id="yield_percentage"
                                            name="yield_percentage"
                                            value={newProduct.yield_percentage}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                            placeholder="Enter yield percentage"
                                        />
                                        {validationErrors.yield_percentage && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.yield_percentage}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="net_weight_of_product"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            Net weight of product
                                        </label>
                                        <input
                                            type="number"
                                            id="net_weight_of_product"
                                            name="net_weight_of_product"
                                            value={newProduct.net_weight_of_product}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                            placeholder="Enter net weight of product"
                                        />
                                        {validationErrors.net_weight_of_product && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.net_weight_of_product}
                                            </p>
                                        )}
                                    </div>
                                    {/* <div>
                                        <label
                                            htmlFor="bom_cost_per_kg"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            BOM Cost per KG
                                        </label>
                                        <div className="flex">
                                            <select
                                                value={currency}
                                                onChange={e => setCurrency(e.target.value)}
                                                className="p-2 border rounded-l focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                            >
                                                <option value="INR">₹</option>
                                                <option value="USD">$</option>
                                                <option value="EUR">€</option>
                                            </select>
                                            <input
                                                type="number"
                                                id="bom_cost_per_kg"
                                                name="bom_cost_per_kg"
                                                value={newProduct.bom_cost_per_kg}
                                                onChange={handleInputChange}
                                                className="flex-grow p-2 border-t border-b border-r rounded-r focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                                placeholder="Enter BOM cost per KG"
                                            />
                                        </div>
                                        {validationErrors.bom_cost_per_kg && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.bom_cost_per_kg}
                                            </p>
                                        )}
                                    </div> */}
                                </form>

                                <div className="mt-6 flex justify-end space-x-4 mb-6">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProducts}
                                        className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors"
                                    >
                                        {isEditMode ? "Save Changes" : "Add Product"}
                                    </button>
                                </div>

                                {selectedSku?.products && selectedSku.products.length > 0 ? (
                                    <div>
                                        <h3 className="text-xl font-semibold text-[#000060] mb-2">
                                            Existing Products
                                        </h3>
                                        <table className="w-full border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-[#f0f0f9]">
                                                    <th className="p-2 text-left">Name</th>
                                                    <th className="p-2 text-left">Quantity</th>
                                                    <th className="p-2 text-left">Raw Material</th>
                                                    <th className="p-2 text-left">Yield %</th>
                                                    <th className="p-2 text-left">Net weight</th>
                                                    {/* <th className="p-2 text-left">BOM Cost</th> */}
                                                    <th className="p-2 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentProducts.map((product, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.product_name}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.quantity_per_assembly}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.raw_material_type_name ||
                                                                rawMaterial.find(rm => rm.id === product.raw_material_type)?.raw_material_name}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.yield_percentage}%
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.net_weight_of_product}
                                                        </td>
                                                        {/* <td className="p-2 border-b border-[#e1e1f5]">
                                                            {currency} {product.bom_cost_per_kg}
                                                        </td> */}
                                                        <td className="p-2 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditProduct(selectedSku.sku_id, index)
                                                                }
                                                                className="text-[#000060] hover:text-[#0000a0] mr-2 p-1 rounded-full hover:bg-gray-100"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveProduct(selectedSku.sku_id, index)
                                                                }
                                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="mt-4 flex justify-center">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleProductPageChange(currentProductPage - 1)
                                                    }
                                                    disabled={currentProductPage === 1}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {Array.from(
                                                    { length: totalProductPages },
                                                    (_, i) => i + 1
                                                ).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handleProductPageChange(page)}
                                                        className={`px-3 py-1 rounded-md transition-colors ${currentProductPage === page
                                                            ? "bg-[#000060] text-white"
                                                            : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        handleProductPageChange(currentProductPage + 1)
                                                    }
                                                    disabled={currentProductPage === totalProductPages}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#4b4b80] italic">
                                        No products added yet. Use the form above to add a new
                                        product.
                                    </p>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence className="top-0">
                    {isBOMmodalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            >
                                {successMessage && (
                                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                                        {successMessage}
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#000060]">
                                        BOM Products for {selectedSku?.sku_name}
                                    </h2>
                                    <button
                                        onClick={handleCloseBOMmodal}
                                        className="text-[#000060] hover:text-[#0000a0]"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-semibold text-[#000060] mb-4">
                                    {isEditMode ? "Edit BOM Product" : "Add New BOM Product"}
                                </h3>
                                <form
                                    onSubmit={e => e.preventDefault()}
                                    className="space-y-4 mb-6"
                                >
                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="isFinalBOM"
                                            name="isFinalBOM"
                                            checked={newProduct.isFinalBOM || false}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                // Clear the disabled fields when unchecked
                                                const updatedProduct = {
                                                    ...newProduct,
                                                    isFinalBOM: e.target.checked,
                                                    // Clear dependent fields when unchecked
                                                    ...(!e.target.checked && {
                                                        final_bom_cost: '',
                                                        quantity_per_assembly: '',
                                                        net_weight_of_product: '',
                                                        bom_cost_per_kg: ''
                                                    })
                                                };
                                                const isChecked = e.target.checked;
                                                setNewProduct(prev => ({
                                                    ...prev,
                                                    isFinalBOM: isChecked,
                                                    // Reset dependent fields when changing the checkbox
                                                    ...(isChecked ? {
                                                        quantity_per_assembly: '',
                                                        net_weight_of_product: '',
                                                        bom_cost_per_kg: ''
                                                    } : {
                                                        final_bom_cost: ''
                                                    })
                                                }));
                                                setValidationErrors(prev => ({
                                                    ...prev,
                                                    quantity_per_assembly: '',
                                                    net_weight_of_product: '',
                                                    final_bom_cost: ''
                                                }));
                                                // Update the state with the new object
                                                // setNewProduct(updatedProduct);
                                            }}
                                            className="h-4 w-4 text-[#000060] focus:ring-[#000060] border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="isFinalBOM"
                                            className="ml-2 block text-sm font-medium text-[#000060]"
                                        >
                                            Final BOM Cost
                                        </label>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="product_name"
                                            className="block text-sm font-medium text-[#000060] mb-1"
                                        >
                                            BOM Product Name
                                        </label>
                                        <input
                                            type="text"
                                            id="product_name"
                                            name="product_name"
                                            value={newProduct.product_name}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                            placeholder="Enter product name"
                                        />
                                        {validationErrors.product_name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {validationErrors.product_name}
                                            </p>
                                        )}
                                    </div>

                                    {newProduct.isFinalBOM ? (
                                        <div>
                                            <label
                                                htmlFor="final_bom_cost"
                                                className="block text-sm font-medium text-[#000060] mb-1"
                                            >
                                                Final BOM Cost
                                            </label>
                                            <div className="flex">
                                                <select
                                                    value={currency}
                                                    onChange={e => setCurrency(e.target.value)}
                                                    className="p-2 border rounded-l focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                                >
                                                    <option value="INR">₹</option>
                                                    <option value="USD">$</option>
                                                    <option value="EUR">€</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    id="final_bom_cost"
                                                    name="final_bom_cost"
                                                    value={newProduct.final_bom_cost || ''}
                                                    onChange={handleInputChange}
                                                    className="flex-grow p-2 border-t border-b border-r rounded-r focus:ring-2 focus:ring-[#000060] focus:border-transparent"
                                                    placeholder="Enter final BOM cost"
                                                />
                                            </div>
                                            {validationErrors.final_bom_cost && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {validationErrors.final_bom_cost}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label
                                                    htmlFor="quantity_per_assembly"
                                                    className="block text-sm font-medium text-[#000060] mb-1"
                                                >
                                                    Quantity per Assembly
                                                </label>
                                                <input
                                                    type="number"
                                                    id="quantity_per_assembly"
                                                    name="quantity_per_assembly"
                                                    value={newProduct.quantity_per_assembly}
                                                    onChange={handleInputChange}
                                                    disabled={newProduct.isFinalBOM}
                                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent ${newProduct.isFinalBOM ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    placeholder="Enter quantity"
                                                />
                                                {validationErrors.quantity_per_assembly && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {validationErrors.quantity_per_assembly}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="net_weight_of_product"
                                                    className="block text-sm font-medium text-[#000060] mb-1"
                                                >
                                                    Net weight of product
                                                </label>
                                                <input
                                                    type="number"
                                                    id="net_weight_of_product"
                                                    name="net_weight_of_product"
                                                    value={newProduct.net_weight_of_product}
                                                    onChange={handleInputChange}
                                                    disabled={newProduct.isFinalBOM}
                                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#000060] focus:border-transparent ${newProduct.isFinalBOM ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    placeholder="Enter net weight of product"
                                                />
                                                {validationErrors.net_weight_of_product && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {validationErrors.net_weight_of_product}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="bom_cost_per_kg"
                                                    className="block text-sm font-medium text-[#000060] mb-1"
                                                >
                                                    BOM Cost per KG
                                                </label>
                                                <div className="flex">
                                                    <select
                                                        value={currency}
                                                        onChange={e => setCurrency(e.target.value)}
                                                        disabled={newProduct.isFinalBOM}
                                                        className={`p-2 border rounded-l focus:ring-2 focus:ring-[#000060] focus:border-transparent ${newProduct.isFinalBOM ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="INR">₹</option>
                                                        <option value="USD">$</option>
                                                        <option value="EUR">€</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        id="bom_cost_per_kg"
                                                        name="bom_cost_per_kg"
                                                        value={newProduct.bom_cost_per_kg}
                                                        onChange={handleInputChange}
                                                        disabled={newProduct.isFinalBOM}
                                                        className={`flex-grow p-2 border-t border-b border-r rounded-r focus:ring-2 focus:ring-[#000060] focus:border-transparent ${newProduct.isFinalBOM ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                        placeholder="Enter BOM cost per KG"
                                                    />
                                                </div>
                                                {validationErrors.bom_cost_per_kg && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {validationErrors.bom_cost_per_kg}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </form>

                                {/* Rest of your existing code (buttons, table, etc.) */}
                                <div className="mt-6 flex justify-end space-x-4 mb-6">
                                    <button
                                        onClick={handleCloseBOMmodal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveBOMProducts}
                                        className="px-4 py-2 bg-[#000060] text-white rounded-md hover:bg-[#0000a0] transition-colors"
                                    >
                                        {isEditMode ? "Save Changes" : "Add Product"}
                                    </button>
                                </div>

                                {/* Existing products table remains the same */}
                                {selectedSku?.products && selectedSku.products.length > 0 ? (
                                    <div className="max-h-[500px] overflow-y-auto">
                                        <h3 className="text-xl font-semibold text-[#000060] mb-2">
                                            Existing Products
                                        </h3>
                                        <table className="w-full border-collapse rounded-lg">
                                            <thead>
                                                <tr className="bg-[#f0f0f9]">
                                                    <th className="p-2 text-left">Name</th>
                                                    {/* <th className="p-2 text-left">Type</th> */}
                                                    <th className="p-2 text-left">Quantity</th>
                                                    <th className="p-2 text-left">Net weight</th>
                                                    <th className="p-2 text-left">BOM Cost</th>
                                                    <th className="p-2 text-left">Final BOM Cost</th>
                                                    <th className="p-2 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="overflow-auto">
                                                {currentBomProductsList.map((product, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.product_name}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.isFinalBOM ? "-" : product.quantity_per_assembly}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.isFinalBOM ? "-" : product.net_weight_of_product}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.final_bom_cost ? "" : currency + " " + product.bom_cost_per_kg}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.final_bom_cost ? currency + " " + product.final_bom_cost : ""}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditProduct(selectedSku.sku_id, index)
                                                                }
                                                                className="text-[#000060] hover:text-[#0000a0] mr-2 p-1 rounded-full hover:bg-gray-100"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveProduct(selectedSku.sku_id, index)
                                                                }
                                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Pagination remains the same */}
                                        <div className="mt-4 flex justify-center">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleProductPageChange(currentProductPage - 1)
                                                    }
                                                    disabled={currentProductPage === 1}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {Array.from(
                                                    { length: totalBomProductPages },
                                                    (_, i) => i + 1
                                                ).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handleProductPageChange(page)}
                                                        className={`px-3 py-1 rounded-md transition-colors ${currentProductPage === page
                                                            ? "bg-[#000060] text-white"
                                                            : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        handleProductPageChange(currentProductPage + 1)
                                                    }
                                                    disabled={currentProductPage === totalBomProductPages}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#4b4b80] italic">
                                        No products added yet. Use the form above to add a new product.
                                    </p>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>


                <AnimatePresence className="top-0">
                    {isNonBOMmodalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            >
                                {successMessage && (
                                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                                        {successMessage}
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#000060]">
                                        Products for {selectedSku?.sku_name}
                                    </h2>
                                    <button
                                        onClick={handleCloseNonBOMmodal}
                                        className="text-[#000060] hover:text-[#0000a0]"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* <h3 className="text-xl font-semibold text-[#000060] mb-4">
                                    {isEditMode ? "Edit BOM Product" : "Add New BOM Product"}
                                </h3> */}

                                {/* Existing products table remains the same */}
                                {selectedSku?.products && selectedSku.products.length > 0 ? (
                                    <div>
                                        <h3 className="text-xl font-semibold text-[#000060] mb-2">
                                            Existing Products
                                        </h3>
                                        <table className="w-full border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-[#f0f0f9]">
                                                    <th className="p-2 text-left">Name</th>
                                                    <th className="p-2 text-left">Quantity</th>
                                                    <th className="p-2 text-left">Raw Material</th>
                                                    <th className="p-2 text-left">Yield %</th>
                                                    <th className="p-2 text-left">Net weight</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentNonBomProductsList.map((product, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.product_name}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.quantity_per_assembly}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.raw_material_type_name ||
                                                                rawMaterial.find(rm => rm.id === product.raw_material_type)?.raw_material_name}
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.yield_percentage}%
                                                        </td>
                                                        <td className="p-2 border-b border-[#e1e1f5]">
                                                            {product.net_weight_of_product}
                                                        </td>

                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="mt-4 flex justify-center">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleProductPageChange(currentNonBomProductsList - 1)
                                                    }
                                                    disabled={currentNonBomProductsList === 1}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {Array.from(
                                                    { length: totalNonBomProductPages },
                                                    (_, i) => i + 1
                                                ).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handleProductPageChange(page)}
                                                        className={`px-3 py-1 rounded-md transition-colors ${currentNonBomProductsList === page
                                                            ? "bg-[#000060] text-white"
                                                            : "bg-[#f0f0f9] text-[#000060] hover:bg-[#e1e1f5]"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        handleProductPageChange(currentNonBomProductsList + 1)
                                                    }
                                                    disabled={currentNonBomProductsList === totalNonBomProductPages}
                                                    className="px-3 py-2 bg-[#f0f0f9] text-[#000060] rounded-md hover:bg-[#e1e1f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#4b4b80] italic">
                                        No products added yet. Use the form above to add a new
                                        product.
                                    </p>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>


        </>
    )
};



function SKUTable({ skus, onAddProduct, onViewProduct }) {
    return (

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e1e1f5]">
                <thead className="bg-[#f8f8fd]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Part No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Drawing No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Annual Usage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b80] uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e1e1f5]">
                    {skus.map((sku, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000060]">{sku.sku_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.part_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.drawing_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.annual_usage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">{sku.size}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4b4b80]">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sku.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {sku.status ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="text-center justify-end space-x-2">
                                <button
                                    onClick={() => onViewProduct(sku)}
                                    className="p-2 rounded-full hover:bg-green-100"
                                    id="my-tooltip"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                                <Tooltip anchorSelect="#my-tooltip">View Products</Tooltip>
                                <button
                                    onClick={() => onAddProduct(sku)}
                                    className="p-2 rounded-full hover:bg-green-100"
                                    id="add-bom"
                                >
                                    <CirclePlusIcon className="w-5 h-5" />
                                    <Tooltip anchorSelect="#add-bom">Add BOM</Tooltip>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}