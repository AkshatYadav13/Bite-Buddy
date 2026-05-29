import { Application, IApplicationDocument } from "../models/application.model";
import { Request, Response } from "express";
import { IUserDocument, User } from "../models/user.model";
import { deleteItemFromCloudinary, uploadImageOnCloundinary } from "../utils/cloudinary";
import { buildSortQuery, toCapitalize } from "../utils/utilityFunctions";
import { DeliveryAgent } from "../models/deliveryAgent.model";

export const getUserApplicationDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const application = await Application.findOne({ user: req.id })
    .populate({path:"user",select:"fullName email contact address"})
    .populate({path:"deliveryAgentDetails.preferredRestaurants",select:"restaurantName location.address"});

    if (!application) {
      res.status(404).json({
        message: "Application not found",
        success: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const submitRestaurantApplication = async (req: Request, res: Response) => {
  try {
    const {
      restaurantName,
      contact,
      cuisines,
      openingTime,
      closingTime,
      foodType,
      latitude,
      longitude,
      address
    } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        message: "Invalid location data",
        success: false,
      });
      return;
    }

    const image = req.file;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }

    if (!user.canApply) {
      res.status(400).json({
        message: "You cannot resubmit this application. Please wait for admin approval.",
        success: false,
      });
      return;
    }

    const existingApplication = await Application.findOne({ user: userId });

    if (existingApplication && !existingApplication.isDeletable) {
      res.status(400).json({
        message: "You already have a pending application",
        success: false,
      });
      return;
    }

    if (existingApplication && existingApplication.isDeletable) {
      await existingApplication.deleteOne();
    }

    let imageUrl;
    if (image) {
      imageUrl = await uploadImageOnCloundinary(image);
    }

    const newApplication = await Application.create({
      user: userId,
      applicationType: "Restaurant",
      restaurantDetails: {
        restaurantName,
        cuisines: cuisines
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean),
        imageUrl,
        contact,
        foodType,
        openingTime,
        closingTime,
        location: {
          latitude: lat,
          longitude: lng,
          address,
          geo: {
            type: "Point",
            coordinates: [lng, lat], // IMPORTANT: [lng, lat]
          },
        },
      },
    });

    user.canApply = false;
    user.applicationId = newApplication._id;
    await user.save();

    res.status(201).json({
      message: "Restaurant application submitted successfully",
      newApplication,
      success: true,
    });

  } catch (error) {
    console.error("Error submitting restaurant application:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};


export const submitDeliveryAgentApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.id;
    const licenseNumberPattern = /^[A-Z]{2}\d{2}\s?\d{4}\d{8}$/;
    const vehicleNumberPattern = /^[A-Z]{2}\d{2}\s[A-Z]{0,2}\s\d{4}$/;
    const {
      licenseNumber,
      vehicleType,
      vehicleNumber,
      preferredRestaurants
    } = req.body;

    const user = await User.findById(userId);

    if (!licenseNumberPattern.test(licenseNumber)) {
      res.status(400).json({
        message: `Invalid License Number (${licenseNumber})`,
        success: false,
      });
      return;
    }
    if (!vehicleNumberPattern.test(vehicleNumber)) {
      res.status(400).json({
        message: `Invalid Vehicle Number (${vehicleNumber})`,
        success: false,
      });
      return;
    }
    if (!user) {
      res.status(400).json({
        message: `User not found`,
        success: false,
      });
      return;
    }

    if (!user.canApply) {
      res.status(400).json({
        message:
          "You cannot resubmit this application. Please wait for admin approval.",
        success: false,
      });
      return;
    }

    const application = await Application.findOne({ user: userId });
    if (application && application.isDeletable) {
      res.status(400).json({
        message:
          "You cannot resubmit this application. Please wait for admin approval.",
        success: false,
      });
      return;
    }
    if (application) {
      res.status(400).json({
        message: "You have already submitted a delivery agent application.",
        success: false,
      });
      return;
    }
    
    const agent = await DeliveryAgent.findOne({
      $or: [
        { licenseNumber },
        { vehicleNumber }
      ]
    });

    if (agent) {
      res.status(400).json({
        message: "Agent already exists with this license or vehicle number",
        success: false,
      });
      return 
    }


    const newApplication = await Application.create({
      user: userId,
      applicationType: "Delivery_Agent",
      deliveryAgentDetails:{
        licenseNumber,
        vehicleNumber,
        vehicleType,
        preferredRestaurants,
      }
    })

    user.canApply = false;
    user.applicationId = newApplication._id
    await user.save();

    res.status(200).json({
      message: `Successfully applied for delivery agent role.`,
      newApplication,
      success: true,
    });
  } catch (error) {
    console.error("Error occured while submitting delivery application :", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id;
    const { reason } = req.body;
    
    const status = req.body.status && toCapitalize(req.body.status);

    const application = await Application.findById(applicationId).populate({
      path: "user",
      select: "fullName email contact role",
    }).populate({path:"deliveryAgentDetails.preferredRestaurants",select:"restaurantName location.address"});


    if (!application) {
      res.status(400).json({
        message: "Application not found",
        success: false,
      });
      return;
    }

    if (application.status === status) {
      res.status(400).json({
        message: `The application is already marked as ${status}. No changes were made`,
        success: false,
      });
      return;
    }

    const applicant = await User.findById(application.user);

    if (!applicant || applicant.role !== "Applicant") {
      res.status(400).json({
        message: "Applicant not found",
        success: false,
      });
      return;
    }

    application.status = status;
    reason && (application.reason = reason);
    application.reviewedAt = new Date();

    await application.save();

    res.status(200).json({
      message: `Application has been ${status.toLowerCase()}.`,
      updatedApplication: application,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getRestaurantsApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchTerm = (req.query.search as string) || "";
    const status = (req.query.status as string) || "All";
    const foodType = (req.query.foodType as string) || "All";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const filterQuery: any = {
      applicationType: "Restaurant",
    };

    if (status !== "All") {
      filterQuery.status = status;
    }

    if (foodType !== "All") {
      filterQuery["restaurantDetails.foodType"] = foodType;
    }

    const sortQuery: any = buildSortQuery(sortBy, sortOrder);
    let totalCount = 0;
    let applications = [];

    const query = Application.find(filterQuery)
      .populate({
        path: "user",
        select: "fullName email contact",
      })
      .sort(sortQuery);

    if (searchTerm) {
      const allApplications = (await query.exec()) as IApplicationDocument[];
      const filtered = allApplications.filter((app) => {
        const user = app.user as IUserDocument;
        return (
          app.restaurantDetails &&
          (app.restaurantDetails.restaurantName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            app.restaurantDetails.location.address
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      totalCount = filtered.length;
      applications = filtered.slice(skip, skip + limit);
    } else {
      applications = await query.skip(skip).limit(limit).exec();
      totalCount = await Application.countDocuments(filterQuery);
    }

    res.status(200).json({
      success: true,
      applications,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDeliveryAgentsApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchTerm = (req.query.search as string) || "";
    const status = (req.query.status as string) || "All";
    const vehicleType = (req.query.vehicleType as string) || "All";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const filterQuery: any = {
      applicationType: "Delivery_Agent",
    };

    if (status !== "All") {
      filterQuery.status = status;
    }

    if (vehicleType !== "All") {
      filterQuery["deliveryAgentDetails.vehicleType"] = vehicleType;
    }

    const sortQuery: any = buildSortQuery(sortBy, sortOrder);
    let totalCount = 0;
    let applications: IApplicationDocument[] = [];

    const query = Application.find({
      ...filterQuery,
    })
      .populate({
        path: "user",
        select: "fullName email contact",
      })
      .populate({path:"deliveryAgentDetails.preferredRestaurants",select:"restaurantName location.address"})
      .sort(sortQuery);

    if (searchTerm) {
      const allApplications = (await query.exec()) as IApplicationDocument[];
      const filtered = allApplications.filter((app) => {
        const user = app.user as IUserDocument;
        return (
          app.deliveryAgentDetails?.licenseNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      totalCount = filtered.length;
      applications = filtered.slice(skip, skip + limit);
    } else {
      applications = await query.skip(skip).limit(limit).exec();
      totalCount = await Application.countDocuments({ ...filterQuery });
    }

    if (sortBy === "userName") {
      applications.sort((a, b) => {
        const aName = (a.user as IUserDocument).fullName;
        const bName = (b.user as IUserDocument).fullName;
        return sortOrder === "desc"
          ? bName.localeCompare(aName)
          : aName.localeCompare(bName);
      });
    }

    res.status(200).json({
      applications,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const makeApplicationDeletable = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);

    if (!application) {
      res.status(500).json({
        message: "Application not found",
        success: false,
      });
      return;
    }

    const applicant = (await User.findById(application.user)) as IUserDocument;
    if (!applicant) {
      res.status(500).json({
        message: "Applicant not found",
        success: false,
      });
      return;
    }

    applicant.applicationId = undefined
    await applicant.save()
    
    application.isDeletable = true;
    await application.save();

    res.status(200).json({
      message: "Deletion Request sent.you can reapply is admin allow you",
      success: true,
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      success: false,
    });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId) as IApplicationDocument;

    if (!application) {
      res.status(500).json({
        message: "Application not found",
        success: false,
      });
      return;
    }
    
    if(!application.isDeletable){
      res.status(500).json({
        message: "Application Deletion not approved",
        success: false,
      });
      return;
    }

    const applicant = (await User.findById(application.user)) as IUserDocument;
    if (!applicant) {
      res.status(500).json({
        message: "Applicant not found",
        success: false,
      });
      return;
    }

    const shouldDeleteResImage = application.applicationType === "Restaurant" && application.status === "Rejected"  && application.restaurantDetails?.imageUrl

    if(shouldDeleteResImage && application.restaurantDetails){
      let imageUrl = application.restaurantDetails.imageUrl
      if(imageUrl){
        deleteItemFromCloudinary(imageUrl);
      }
    }

    await application?.deleteOne();

    applicant.canApply = true;
    await applicant.save();

    res.status(200).json({
      message: "Application deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
