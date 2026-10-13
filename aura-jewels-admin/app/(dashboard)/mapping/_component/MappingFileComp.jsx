import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "sonner";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import FullPageLoader from "@/components/FullPageLoader";
import { STATUS_CODE } from "@/lib/Constant";

const MappingFileComp = ({
  setIsShowMapCom,
  excelHeadArr,
  vendorId,
  setIsLoading,
  isLoading,
  fileType,
}) => {
  const token = getToken();

  const DBField = [
    "vendorStockId",
    "shape",
    "clarity",
    "color",
    "carat",
    "cut",
    "polish",
    "sym",
    "flo",
    "lab",
    "brownInc",
    "offPer",
    "finalamount",
    "rate",
    "ratio",
    "measurement",
    "measLength",
    "measWidth",
    "measDepth",
    "depth",
    "tablePercent",
    "tableBlack",

    "sideBlack",
    "tableOpen",
    "crwnOpen",
    "pavOpen",
    "grdOpen",
    "tableEfac",
    "crwnEfac",
    "pavEfac",
    "HA",
    "certNo",
    "certURL",
    "girdlePct",
    "girdleCondition",
    "crownAngle",
    "pavilionAngle",
    "crownHeight",
    "pavilionHeight",
    "culetSize",
    "keyToSymbols",
    "diamondStatus",
    "location",
    "comment",
    "imageURL1",
    "imageURL2",
    "imageURL3",
    "imageURL4",
    "videoURL",
    "margin",
    "vendor_price_per_carat",
    "RAPNet",
    "lust",
    "intensity",
    "WIC",
    "exclusiveMarkUp",
    "discountedRatePerCarat",
    "UCP",
    "vendoramount",
    "pairId",
    "diamondType",
  ];
  const ReqField = [
    "vendorStockId",
    "shape",
    "clarity",
    "color",
    "carat",
    "cut",
    "polish",
    "sym",
    "flo",
    "lab",
    "measurement",
    "depth",
    "tablePercent",
    "vendor_price_per_carat",
    "RAPNet",
  ];
  const [selectedFieldArr, setSelectedFieldArr] = useState([]);
  const [selectedFieldObj, setSelectedFieldObj] = useState({});
  const [vendorMapData, setVendorMapData] = useState({});

  const initialValues = Object.fromEntries(DBField.map((field) => [field, ""]));
  const validationSchema = Object.fromEntries(
    DBField.map((field) => {
      if (ReqField.includes(field)) {
        return [field, Yup.string().required("This field is required")];
      } else {
        return [field, Yup.string()];
      }
    })
  );

  const {
    touched,
    errors,
    values,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: { ...initialValues, mappingType: "", priceIn: "" },
    validationSchema: Yup.object({
      ...validationSchema,
      mappingType: Yup.string().required("This field is required"),
      priceIn: Yup.string().required("This field is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (frmVal) => {
      setIsLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      let formData = new FormData();
      // Dynamically append all key-value pairs to FormData
      Object.entries(frmVal).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("vendorId", vendorId);
      let url = `${API_URL?.SET_MAPPING}`;
      console.log("form values--->", frmVal);
      callApi(url, "POST", formData, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            setIsShowMapCom(false);
          } else {
            toast.error(result?.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
        });
    },
  });

  const handleChangeField = (e) => {
    const { value, name } = e.target;

    // Remove previously selected value for this field (if any)
    if (selectedFieldObj[name]) {
      const prevVal = selectedFieldObj[name];
      if (prevVal && prevVal !== value) {
        // Remove previous value from array
        setSelectedFieldArr((prevArr) => prevArr.filter((o) => o !== prevVal));
      }
    }

    // If option already present in selected array and not in this field, warn
    if (
      selectedFieldArr.includes(value) &&
      selectedFieldObj[name] !== value &&
      value !== ""
    ) {
      setFieldValue(name, "");
      toast.warning("This Field All Ready Selected.");
      return;
    }

    // Handle case for clearing selection
    if (value === "") {
      if (selectedFieldObj[name]) {
        const prevVal = selectedFieldObj[name];
        setSelectedFieldArr((prevArr) => prevArr.filter((o) => o !== prevVal));
        delete selectedFieldObj[name];
        setSelectedFieldObj({ ...selectedFieldObj });
        setFieldValue(name, "");
      }
      return;
    }

    // Otherwise, set new selection
    setSelectedFieldObj((prev) => ({ ...prev, [name]: value }));
    setSelectedFieldArr((prevArr) => [...prevArr, value]);
    setFieldValue(name, value);
  };

  const GetVendorMapping = () => {
    callApi(`${API_URL?.GET_MAPPING}/${vendorId}/${fileType}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setVendorMapData(result?.data);
        }
      });
  };

  useEffect(() => {
    GetVendorMapping();
  }, []);

  return (
    <>
      <FullPageLoader isLoad={isLoading} />
      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        <div className="relative overflow-x-auto">
          <form onSubmit={handleSubmit}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Fields From Database
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Fields From Excel Sheet
                  </th>
                </tr>
              </thead>
              <tbody>
                {DBField.map((field, index) => {
                  return (
                    <tr
                      key={`DBField-${index}`}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                    >
                      <td className="px-6 py-4">
                        <span>
                          <b>{field}</b>
                        </span>
                        {ReqField.includes(field) && (
                          <span className="text-red-500">*</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[50%] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 hand"
                          name={field}
                          value={values[field] || ""}
                          onChange={handleChangeField}
                        >
                          <option value="">--- Select Field ---</option>
                          {excelHeadArr?.map((value, index) => {
                            return (
                              <option key={`vendorlist-${index}`} value={value}>
                                {value}
                              </option>
                            );
                          })}
                        </select>
                        {touched[field] && errors[field] && (
                          <p className="text-sm text-red-500">
                            {errors[field]}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}

                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                  <td className="px-6 py-4">
                    <span>
                      <b>Mappign type</b>
                    </span>
                    <span className="text-red-500">*</span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[50%] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 hand"
                      name="mappingType"
                      value={values.mappingType || ""}
                      onChange={handleChangeField}
                    >
                      <option value="">--- Select Field ---</option>
                      <option value="EXCEL">Excel</option>
                      <option value="JSON">JSON</option>
                    </select>
                    {touched.mappingType && errors.mappingType && (
                      <p className="text-sm text-red-500">
                        {errors.mappingType}
                      </p>
                    )}
                  </td>
                </tr>

                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                  <td className="px-6 py-4">
                    <span>
                      <b>PriceIN</b>
                    </span>
                    <span className="text-red-500">*</span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[50%] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 hand"
                      name="priceIn"
                      value={values.priceIn || ""}
                      onChange={handleChangeField}
                    >
                      <option value="">--- Select Field ---</option>
                      <option value="DOLLER">DOLLER</option>
                      <option value="RUPEE">RUPEE</option>
                    </select>
                    {touched.priceIn && errors.priceIn && (
                      <p className="text-sm text-red-500">{errors.priceIn}</p>
                    )}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <button
                      type="submit"
                      className="hand focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      Save
                    </button>
                    <button
                      type="reset"
                      onClick={() => {
                        setSelectedFieldArr([]);
                        setSelectedFieldObj({});
                        resetForm();
                      }}
                      className="hand focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </form>
        </div>
      </div>
    </>
  );
};

export default MappingFileComp;
