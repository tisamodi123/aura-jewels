"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import DataTable from "react-data-table-component";
import { Edit2, Trash, HomeIcon } from "lucide-react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";
import { useFormik } from "formik";
import { STATUS_CODE } from "@/lib/Constant";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { MdDelete, MdEdit } from "react-icons/md";

const ParaTypeMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  // const title = pathname?.replace("/","")?.split('')?.map((v,i)=>i==0?v.toUpperCase():v)?.join("");
  const title = pathname?.replace("/", "")?.split("")?.join("");

  const [paraTypeList, setParaTypeList] = useState([]);
  const [paraTypeId, setParaTypeId] = useState(0);
  const [parameterList, setParameterList] = useState([]);
  const [paraTypeName, setParaTypeName] = useState("");
  const [parameterName, setParameterName] = useState("");
  const [description, setDescription] = useState("");
  const [parameterId, setParameterId] = useState("");
  const [sort, setSort] = useState("");
  const [acceptableValues, setAcceptableValues] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imgPrev1, setImgPrev1] = useState("");
  const [isPrevImg, setIsPrevImg] = useState(false);

  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const GetParaTypeList = () => {
    callApi(`${API_URL?.PARA_TYPE_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setParaTypeList(result?.data);
          setParaTypeId(result?.data?.[0]?.id);
        }
      });
  };

  const GetPrameterList = () => {
    const formData = new FormData();
    formData.append("paraTypeId", paraTypeId);

    callApi(`${API_URL?.PARAMETER_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setParameterList(result?.data);
          setSort(result?.data?.length > 0 ? result?.data?.length + 1 : 1);
        }
      });
  };

  const UpdateStatus = (id) => {
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_PARAMETER_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetPrameterList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteParaType = (id) => {
    Swal.fire({
      title: "Delete Parameter",
      text: "Are You Sure Want To Delete Parameter?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_PARAMETER}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetPrameterList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };


  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setParameterId("");
    setParameterName("");
    setDescription("");
    setAcceptableValues("");
    setSort("");
    setShowModal(false);
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => {
        return index + 1;
      },
    },
    {
      name: "Parameter Name",
      selector: (row) => row.paraMtrName,
    },
    {
      name: "Description",
      selector: (row) => row.description,
    },
    {
      name: "Sort",
      selector: (row) => row.sort,
    },
    {
      name: "Status",
      cell: (row) => {
        return (
          <span
            className={`hand px-4 py-2 text-xs rounded-md ${row.status == "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              } `}
            onClick={() => UpdateStatus(row?.id)}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <>
            <div>
              <MdEdit
                color="green"
                className="hand hover: rounded-lg hover:bg-green-200 p-1"
                size={30}
                onClick={() => handleShowModal(row)}
              />
            </div>
            <div className="ml-5">
              <MdDelete
                color="red"
                className="hand hover: rounded-lg hover:bg-red-200 p-1"
                size={30}
                onClick={() => DeleteParaType(row?.id)}
              />
            </div>
          </>
        );
      },
    },
  ];

  const handleShowModal = (data) => {
    setParameterId(data?.id);
    setParameterName(data?.paraMtrName ? data?.paraMtrName : "");
    setDescription(data?.description ? data?.description : "");
    setAcceptableValues(
      data?.acceptableValues ? data?.acceptableValues?.join(",") : ""
    );
    setSort(data?.sort ? data?.sort : "");
    setImgPrev1(data?.image1 ? data?.image1 : "");

    if (!paraTypeId) {
      resetForm();
    }
    setShowModal(true);
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      parameterName: parameterName,
      description: description,
      sort: sort,
      acceptableValues: acceptableValues,
      image1: "",
      isPrevImg: isPrevImg,
    },
    validationSchema: Yup.object({
      parameterName: Yup.string().required("Para Type name is required"),
      description: Yup.string().required("Description is required"),
      sort: Yup.string().required("Sort is required"),
      acceptableValues: Yup.string(),
      isPrevImg: Yup.boolean(),
      image1: Yup.mixed().when("isPrevImg", {
        is: (value) => value == true,
        then: () =>
          Yup.mixed()
            .required("First Name is required")
            .test(
              "image1",
              "Unsupported file format",
              (file) => file && SUPPORTED_FORMATS.includes(file.type)
            ),
        otherwise: () => Yup.mixed().notRequired(),
      }),
      // image1 : Yup.mixed().nullable().test("image1", "Unsupported file format", (file) => file && SUPPORTED_FORMATS.includes(file.type)),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("paraTypeId", paraTypeId);
      formdata.append("paraMtrName", val.parameterName);
      formdata.append("description", val.description);
      formdata.append("sort", val.sort);
      formdata.append("acceptableValues", val.acceptableValues);
      formdata.append("image1", val.image1);

      let url = `${API_URL?.CREATE_PARAMETER}/`;
      if (parameterId) {
        url = `${API_URL?.UPDATE_PARAMETER}/${parameterId}`;
      }
      callApi(url, parameterId ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetPrameterList();
            handleCloseModal();
          } else {
            toast.error(result?.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
        });
    },
  });

  useEffect(() => {
    GetParaTypeList();
  }, []);

  useEffect(() => {
    if (paraTypeId) {
      GetPrameterList();
    }
  }, [paraTypeId]);

  useEffect(() => {
    console.log("para", paraTypeName);
    if (paraTypeName == "Shape") {
      setIsPrevImg(true);
    } else {
      setIsPrevImg(false);
    }
  }, [paraTypeName]);

  return (
    <>
      <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm flex justify-between">
        <nav aria-label="Breadcrumb" className="la pt-2">
          <ol role="list" className="flex">
            <li>
              <div>
                <Link href="/dashboard" className="flex">
                  <HomeIcon
                    size={18}
                    className="cursor-pointer text-blue-900 mr-2"
                  />
                  <span>Home</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <span>All Settings</span>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <span>Diamond Parameter Master</span>
              </div>
            </li>
          </ol>
        </nav>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Create
        </Button>
      </div>

      <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm flex justify-start">
        {paraTypeList.map((value, index) => {
          if (
            title == "dparameter" &&
            value?.type?.toLowerCase() == "diamond"
          ) {
            return (
              <div key={`paratype-${index}`} className="pr-3">
                <Button
                  onClick={() => {
                    setParaTypeId(value?.id);
                    setParaTypeName(value?.name);
                  }}
                  className={`hand ${paraTypeId == value.id ? "active-paratype " : ""
                    } text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm  dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`}
                >
                  {value?.name}
                </Button>
              </div>
            );
          }
        })}
      </div>

      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        <DataTable
          columns={columns}
          data={parameterList}
          pagination={true}
          paginationPerPage={10}
        />
      </div>

      {/* Manage Role Model Start */}
      <Modal
        isOpen={showModal}
        onRequestClose={handleCloseModal}
        contentLabel="Add Role"
        ariaHideApp={false}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            maxWidth: "500px",
            padding: 0,
            borderRadius: "7px",
            zIndex: 1000,
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
          },
        }}
      >
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-header">
            <h4 className="modal-title">
              <span>{paraTypeId ? "Edit" : "Add"}</span> Para Type
            </h4>
            <Button
              type="button"
              className="modal-close hand"
              onClick={handleCloseModal}
            >
              <span>&times;</span>
            </Button>
          </div>

          <div className="modal-body">
            <div className="grid grid-cols mt-2">
              <div>
                <Label className="text-sm font-medium">Parameter Name</Label>
                <Input
                  type="text"
                  name="parameterName"
                  value={values.parameterName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Parameter Name"
                />
                {touched.parameterName && errors.parameterName && (
                  <p className="text-sm text-red-500">{errors.parameterName}</p>
                )}
              </div>
              <div className="pt-2">
                <Label className="text-sm font-medium">description</Label>
                <Input
                  type="text"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter description"
                />
                {touched.description && errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              <div className="pt-2">
                <Label className="text-sm font-medium">Sort</Label>
                <Input
                  type="number"
                  name="sort"
                  value={values.sort}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Sort"
                />
                {touched.sort && errors.sort && (
                  <p className="text-sm text-red-500">{errors.sort}</p>
                )}
              </div>
              <div className="pt-2">
                <Label className="text-sm font-medium">Synonyms</Label>
                <Input
                  type="text"
                  name="acceptableValues"
                  value={values.acceptableValues}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Synonyms"
                />
                {touched.acceptableValues && errors.acceptableValues && (
                  <p className="text-sm text-red-500">
                    {errors.acceptableValues}
                  </p>
                )}
              </div>
              {isPrevImg && (
                <div className="pt-2">
                  <Label className="text-sm font-medium">Image</Label>
                  <Input
                    type="file"
                    name="image1"
                    className="hand"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      setFieldValue("image1", file);
                      setImgPrev1(URL.createObjectURL(file)); // Set preview
                    }}
                  />
                  {imgPrev1 && (
                    <img
                      src={imgPrev1}
                      height={100}
                      width={100}
                      className="pt-2"
                      alt="Image Preview"
                    />
                  )}
                  {touched.image1 && errors.image1 && (
                    <p className="text-sm text-red-500">{errors.image1}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            {isLoading ? (
              <Button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 mr-2 rounded"
              >
                Loading...
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded hand"
                >
                  {parameterId ? "Update" : "Save"}
                </Button>
                <Button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hand"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </Modal>
      {/* Manage Role Model End */}
    </>
  );
};

export default ParaTypeMaster;
