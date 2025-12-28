"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import AdminSideBar from "@/components/AdminSideBar";
import { MdSearch, MdAdd } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import SpinnerComp from "@/components/Spinner";
import { useRouter } from "next/navigation";
import styles from "./movie.module.css";

const uploadToS3 = async (signedUrl, file) => {
    const res = await fetch(signedUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type
        },
        body: file   // File === Blob
    });

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return true;
};

const genre = ["action", "romance", "comedy", "drama", "horror", "historical"];
const language = ["English", "Spanish", "Bengali", "Hindi", "French", "Japanese", "Mandarin", "Russian"];

function AddMovieModal({ closeWindow, showLoading, closeLoading }) {

    const [movieData, setMovieData] = useState({
        title: "",
        bio: "",
        year: 1999,
        genre: "",
        language: [],
        cast: "",
        director: "",
        image: "",
        rating: 0,
        video: ""
    });

    const [image, setImage] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [video, setVideo] = useState("");
    const [videoPreview, setVideoPreview] = useState("");
    const fileInputImageRef = useRef(null);
    const fileInputVideoRef = useRef(null);
    const clicked = useRef(false);

    const handleImageFileChange = (event) => {
        // Handle the selected file here
        const file = event.target.files[0];
        const imageURL = URL.createObjectURL(file);
        setImagePreview(imageURL);
        setImage(file);
        setMovieData((prevState => ({ ...prevState, image: file.type })));
        event.target.value = null;
    };
    const handleVideoFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            alert("Please select a valid video file");
            return;
        }

        const videoURL = URL.createObjectURL(file);

        setMovieData((prevState => ({ ...prevState, video: file.type })));
        setVideo(file);
        setVideoPreview(videoURL);

        event.target.value = null;
    };


    const upload = async () => {
        clicked.current = true;

        if (
            !movieData.title.trim() ||
            !movieData.bio.trim() ||
            !movieData.genre ||
            movieData.language.length === 0 ||
            !movieData.cast.trim() ||
            !movieData.director.trim() ||
            !image ||
            !(image instanceof File) ||
            !video ||
            !(video instanceof File) ||
            !movieData.year ||
            movieData.year < 1888 ||
            !movieData.rating ||
            movieData.rating <= 0
        ) {
            toast.error("Fill all required fields correctly");
            clicked.current = false;
            return;
        }

        if (!image.type.startsWith("image/")) {
            toast.error("Invalid image type");
            clicked.current = false;
            return;
        }
        // if (image.size > 50 * 1024 * 1024) {
        //     alert("Image size must be under 5MB");
        //     return;
        // }
        if (!video.type.startsWith("video/")) {
            toast.error("Invalid image type");
            clicked.current = false;
            return;
        }
        if (video.size > 100 * 1024 * 1024) {
            toast.error("Video size must be under 100MB");
            clicked.current = false;
            return;
        }

        let mediaSize = image.size + video.size;

        showLoading();

        try {

            let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/addMovie`, {
                method: 'POST',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: movieData.title,
                    bio: movieData.bio,
                    genre: movieData.genre,
                    director: movieData.director,
                    year: movieData.year,
                    rating: movieData.rating,
                    image: movieData.image,
                    video: movieData.video,
                    language: movieData.language,
                    cast: movieData.cast,
                    mediaSize: mediaSize,
                    token: "68209781nzinw"
                }),
            })

            let res = await req.json();
            if (!res.ok) {
                clicked.current = false;
                closeLoading();
                toast.error(`${res.message}`);
                return;
            }

            toast.success("Movi Uploaded to DB!")

            let imageUpload = await uploadToS3(res.imgUploadCred.uploadUrl, image)

            if (!imageUpload) {
                clicked.current = false;
                toast.warn("Movie image cannot be uploaded !");
            }

            toast.success("Image is uploaded !");

            const videoFormData = new FormData();
            videoFormData.append('file', video);
            videoFormData.append('api_key', res.videoUploadCred.api_key);
            videoFormData.append('timestamp', res.videoUploadCred.timestamp);
            videoFormData.append('signature', res.videoUploadCred.signature);
            videoFormData.append('folder', res.videoUploadCred.folder);
            videoFormData.append("public_id", res.videoUploadCred.public_id);

            let videoUploadData = await new Promise((resolve, reject) => {
                // Progress bar element
                const progressElement = document.getElementById('upload-progress');
                const progressElementText = document.getElementById('upload-progress-text');

                // XMLHttpRequest for uploading to Cloudinary
                const xhr = new XMLHttpRequest();

                xhr.open('POST', `https://api.cloudinary.com/v1_1/${res.videoUploadCred.cloud_name}/${res.videoUploadCred.resource_type}/upload`, true);

                // Track upload progress
                xhr.upload.addEventListener('progress', (e) => {
                    progressElement.style.display = 'flex';
                    if (e.lengthComputable) {
                        const progressPercentage = Math.round((e.loaded / e.total) * 100);
                        progressElementText.innerText = `${progressPercentage}%`;
                    }
                });

                // Handle upload response
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        progressElementText.innerText = 'Video Uploaded !';
                        const response = JSON.parse(xhr.responseText);
                        console.log('Upload complete:', response);
                        progressElement.style.display = 'none';
                        resolve(response); // Resolve with the upload 
                        window.location.reload();
                        ;
                    } else {
                        console.error('Upload failed:', xhr.statusText);
                        toast.error(`Upload failed: ${xhr.status}`);
                        reject(new Error(xhr.statusText)); // Reject with an 
                        progressElement.style.display = 'none';
                        window.location.reload();
                        ;
                    }
                };

                xhr.onerror = () => {
                    console.error('Upload encountered a network error.');
                    toast.error(`Network error during upload`);
                    reject(new Error('Network error during upload'));
                    window.location.reload();
                    ;
                };

                // Send the form data
                xhr.send(videoFormData);

            });

            let recordMedia = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/recordMedia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    movieId: res.movieData._id,
                    imgURL: res.imgUploadCred.fileUrl,
                    videoURL: videoUploadData.secure_url,
                    token: "68209781nzinw"
                }),
            })

            let mediaResponse = await recordMedia.json();
            if (!mediaResponse.ok) {
                toast.error(`${mediaResponse.message}`);
                closeLoading();
            }

            clicked.current = false;
            closeLoading();
            window.location.reload();
            ;
        } catch (error) {
            clicked.current = false;
            alert(`${error.message}`)
            return;
        }

    }


    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div className={styles.addMovieModal}>
            <div className={styles.addmovieContainer}>
                <IoMdCloseCircle size={20} color='white' className={styles.closeBtn} onClick={() => closeWindow()} />
                <h2>Add Movie</h2>
                <div className={styles.addMovieColumns}>
                    <div className={styles.movieColumn}>
                        <div className={styles.inputDiv}>
                            <p>Title</p>
                            <input
                                placeholder='Movie name here...'
                                value={movieData.title}
                                onChange={(e) =>
                                    setMovieData((prev) => ({ ...prev, title: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.inputDiv}>
                            <p>About</p>
                            <input
                                placeholder='About the movie...'
                                value={movieData.bio}
                                onChange={(e) =>
                                    setMovieData((prev) => ({ ...prev, bio: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.inputDiv}>
                            <p>Genre</p>
                            <select
                                value={movieData.genre}
                                onChange={(e) =>
                                    setMovieData((prev) => ({ ...prev, genre: e.target.value }))
                                }
                                className={styles.selectField}
                                style={{ width: "100%" }}
                            >
                                <option value="">Select Genre</option>
                                {genre.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputDiv}>
                            <p>Image</p>
                            <div
                                style={{
                                    width: "100%",
                                    height: 335,
                                    backgroundColor: "#3b3b3b",
                                    borderRadius: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    position: "relative"
                                }}>
                                <input id='thumbnailImage' type="file"
                                    ref={fileInputImageRef}
                                    style={{ display: 'none' }} // Hide the input
                                    onChange={(e) => handleImageFileChange(e)}
                                    accept=".jpg, .png, .jpeg" />
                                {
                                    movieData.image == "" ? <button
                                        style={{
                                            padding: 10,
                                            borderRadius: 8,
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "rgba(76, 207, 0, 1)",
                                            color: "white",
                                            fontWeight: 500,
                                            cursor: "pointer"
                                        }}
                                        onClick={() => fileInputImageRef.current.click()}
                                    >Upload Image</button>
                                        : <img
                                            key={imagePreview}        // VERY IMPORTANT
                                            src={imagePreview}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block"
                                            }}
                                            onClick={() => fileInputImageRef.current.click()}
                                        />
                                }
                            </div>
                        </div>
                    </div>
                    <div className={styles.movieColumn}>

                        <div className={styles.inputDiv} style={{ paddingBottom: 10 }}>
                            <p>Languages</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className={styles.languageChips}>
                                    {movieData.language.length > 0 ? movieData.language.map(lang => (
                                        <span key={lang} className={styles.chip}>
                                            {lang}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMovieData(prev => ({
                                                        ...prev,
                                                        language: prev.language.filter(l => l !== lang)
                                                    }))
                                                }
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                        :
                                        <span style={{ letterSpacing: 1 }}>No languages selected yet</span>
                                    }
                                </div>
                                <select
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (!value) return

                                        setMovieData(prev => ({
                                            ...prev,
                                            language: prev.language.includes(value)
                                                ? prev.language
                                                : [...prev.language, value]
                                        }))
                                    }}
                                    className={styles.selectField}
                                >
                                    <option value="">Select Language</option>
                                    {language.map(lang => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputDiv}>
                            <p>Director</p>
                            <input
                                placeholder='Director name...'
                                value={movieData.director}
                                onChange={(e) =>
                                    setMovieData((prev) => ({ ...prev, director: e.target.value }))
                                }
                            />
                        </div>

                        <div className={styles.doubleInputDiv}>
                            <div className={styles.inputDiv}>
                                <p>Rating</p>
                                <input
                                    type='number'
                                    value={movieData.rating}
                                    onChange={(e) =>
                                        setMovieData((prev) => ({ ...prev, rating: e.target.value }))
                                    }
                                />
                            </div>
                            <div className={styles.inputDiv}>
                                <p>Year</p>
                                <input
                                    type='number'
                                    value={movieData.year}
                                    onChange={(e) =>
                                        setMovieData((prev) => ({ ...prev, year: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className={styles.inputDiv}>
                            <p>Cast</p>
                            <input
                                placeholder='Type names wit commas'
                                value={movieData.cast}
                                onChange={(e) =>
                                    setMovieData((prev) => ({ ...prev, cast: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.inputDiv}>
                            <p>Video</p>
                            <div
                                style={{
                                    width: "100%",
                                    height: 180,
                                    backgroundColor: "#3b3b3b",
                                    borderRadius: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    position: "relative"
                                }}
                            >
                                <input
                                    id="video"
                                    type="file"
                                    ref={fileInputVideoRef}
                                    style={{ display: "none" }}
                                    onChange={handleVideoFileChange}
                                    accept="video/mp4,video/x-matroska,video/webm,video/quicktime,video/x-msvideo"
                                />

                                {
                                    !videoPreview ? <button
                                        style={{
                                            padding: 10,
                                            borderRadius: 8,
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "rgba(76, 207, 0, 1)",
                                            color: "white",
                                            fontWeight: 500,
                                            cursor: "pointer"
                                        }}
                                        onClick={() => fileInputVideoRef.current.click()}
                                    >Upload Video</button>
                                        : <video
                                            key={videoPreview}
                                            src={videoPreview}
                                            controls
                                            preload="metadata"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block"
                                            }}
                                        />
                                }

                            </div>
                        </div>
                        <button className={styles.movieUploadBtn} onClick={() => { !clicked.current ? upload() : toast.warn("Movie Uploading please wait !") }}>
                            <MdAdd size={20} />
                            <span>Add Movie</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const EMPTY_MOVIE = {
    title: "",
    bio: "",
    genre: [],
    director: "",
    year: "",
    rating: "",
    cast: "",
    language: [],
    image: "", // mimeType or whatever backend expects
    video: "", // mimeType or whatever backend expects
};

export function MovieModal({ movieId, closeWindow, showLoading, closeLoading }) {

    const [editMovieData, setEditMovieData] = useState(EMPTY_MOVIE);

    // Selected files
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);

    // Previews can be remote URLs or blob URLs
    const [imagePreview, setImagePreview] = useState("");
    const [videoPreview, setVideoPreview] = useState("");

    // Keep track of blob URLs we create so we can safely revoke them
    const createdImageBlobUrlRef = useRef(null);
    const createdVideoBlobUrlRef = useRef(null);

    const fileInputImageRef = useRef(null);
    const fileInputVideoRef = useRef(null);
    const updateClicked = useRef(false);

    const cleanupBlobUrl = (ref) => {
        if (ref.current && typeof ref.current === "string" && ref.current.startsWith("blob:")) {
            try {
                URL.revokeObjectURL(ref.current);
            } catch (_) { }
            ref.current = null;
        }
    };

    const fetchMovieData = async () => {
        if (!movieId) return;

        try {
            const req = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}movie/fetchMovieData?movieId=${movieId}`
            );
            const res = await req.json();

            console.log(res);


            if (!res?.ok) {
                toast.error(`${res.message}` || "Failed to fetch movie data");
                closeWindow?.();
                return;
            }

            const data = res.data || {};

            // Normalize incoming data to avoid undefined/null crashes
            const normalized = {
                ...EMPTY_MOVIE,
                ...data,
                language: Array.isArray(data.language) ? data.language : [],
                title: typeof data.title === "string" ? data.title : "",
                bio: typeof data.bio === "string" ? data.bio : "",
                genre: Array.isArray(data.genre) ? data.genre : [],
                director: typeof data.director === "string" ? data.director : "",
                cast: Array.isArray(data.cast) ? data.cast.join(", ") : "",
                year: data.year ?? "",
                rating: data.rating ?? "",
            };

            setEditMovieData(normalized);

            // Use remote URLs as preview defaults (do NOT revoke these)
            setImagePreview(data.image || "");
            setVideoPreview(data.videoUrl || "");
        } catch (error) {
            toast.error(error?.message || "Something went wrong while fetching movie data");
            closeWindow?.();
        }
    };

    useEffect(() => {
        fetchMovieData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            cleanupBlobUrl(createdImageBlobUrlRef);
            cleanupBlobUrl(createdVideoBlobUrlRef);
        };
    }, []);

    const handleImageFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            event.target.value = null;
            return;
        }

        // cleanup old blob
        cleanupBlobUrl(createdImageBlobUrlRef);

        const blobUrl = URL.createObjectURL(file);
        createdImageBlobUrlRef.current = blobUrl;

        setImage(file);
        setImagePreview(blobUrl);

        // Store MIME type (as your code intended)
        setEditMovieData((prev) => ({ ...prev, image: file.type }));

        event.target.value = null;
    };

    const handleVideoFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            toast.error("Please select a valid video file");
            event.target.value = null;
            return;
        }

        // cleanup old blob
        cleanupBlobUrl(createdVideoBlobUrlRef);

        const blobUrl = URL.createObjectURL(file);
        createdVideoBlobUrlRef.current = blobUrl;

        setVideo(file);
        setVideoPreview(blobUrl);

        // Store MIME type (as your code intended)
        setEditMovieData((prev) => ({ ...prev, video: file.type }));

        event.target.value = null;
    };

    const validate = () => {
        const title = (editMovieData.title || "").trim();
        const bio = (editMovieData.bio || "").trim();
        const cast = (editMovieData.cast || "").trim();
        const director = (editMovieData.director || "").trim();

        const langs = Array.isArray(editMovieData.language) ? editMovieData.language : [];
        const yearNum = Number(editMovieData.year);
        const ratingNum = Number(editMovieData.rating);

        if (!title || !bio || !editMovieData.genre || langs.length === 0 || !cast || !director) {
            toast.error("Fill all required fields correctly");
            return false;
        }

        if (!Number.isFinite(yearNum) || yearNum < 1888) {
            toast.error("Invalid year");
            return false;
        }

        if (!Number.isFinite(ratingNum) || ratingNum <= 0) {
            toast.error("Invalid rating");
            return false;
        }

        // For EDIT flow: allow existing media to remain if user didn't re-select.
        // If you want media to be mandatory always, remove these conditions and require image/video.
        const hasExistingImageUrl = typeof imagePreview === "string" && imagePreview.length > 0;
        const hasExistingVideoUrl = typeof videoPreview === "string" && videoPreview.length > 0;

        if (!image && !hasExistingImageUrl) {
            toast.error("Movie image is required");
            return false;
        }
        if (image && !image.type.startsWith("image/")) {
            toast.error("Invalid image type");
            return false;
        }

        if (!video && !hasExistingVideoUrl) {
            toast.error("Movie video is required");
            return false;
        }
        if (video && !video.type.startsWith("video/")) {
            toast.error("Invalid video type");
            return false;
        }
        if (video && video.size > 100 * 1024 * 1024) {
            toast.error("Video size must be under 100MB");
            return false;
        }

        return true;
    };

    const upload = async () => {
        if (updateClicked.current) {
            toast("Movie uploading, please wait.");
            return;
        }

        updateClicked.current = true;

        if (!validate()) {
            updateClicked.current = false;
            return;
        }

        showLoading();

        try {

            let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/updateMovieData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editMovieData.title,
                    bio: editMovieData.bio,
                    genre: editMovieData.genre,
                    director: editMovieData.director,
                    year: editMovieData.year,
                    rating: editMovieData.rating,
                    language: editMovieData.language,
                    cast: editMovieData.cast,
                    movieId: movieId,
                    token: "68209781nzinw"
                }),
            })

            let res = await req.json();

            if (!res.ok) {
                closeLoading();
                clicked.current = false;
                toast.error(`${res.message}`);
                return;
            }

            if (image || video) {

                let mediaUpdateReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/updateMovieMedia`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: image ? editMovieData.image : null,
                        video: video ? editMovieData.video : null,
                        token: "32ums902uois0892",
                        movieId: movieId
                    })
                })

                let mediaUpdateRes = await mediaUpdateReq.json();

                const movieIdFromRes = res?.data?._id || movieId;

                // 2) Upload image to S3 only if a new file was selected
                if (image instanceof File) {
                    const imageUploadOk = await uploadToS3(mediaUpdateRes.imgUploadCred.uploadUrl, image);
                    if (!imageUploadOk) {
                        toast.warn("Movie image could not be uploaded");
                        // You can decide whether to stop here. I will stop to keep data consistent.
                        updateClicked.current = false;
                        closeLoading();
                        return;
                    }
                }

                // 3) Upload video to Cloudinary only if a new file was selected
                let uploadedVideoUrl = null;

                if (video instanceof File) {
                    toast.success("Video is getting uploaded");

                    const videoFormData = new FormData();
                    videoFormData.append("file", video);
                    videoFormData.append("api_key", mediaUpdateRes.videoUploadCred.api_key);
                    videoFormData.append("timestamp", String(mediaUpdateRes.videoUploadCred.timestamp));
                    videoFormData.append("signature", mediaUpdateRes.videoUploadCred.signature);
                    videoFormData.append("folder", mediaUpdateRes.videoUploadCred.folder);
                    videoFormData.append("public_id", mediaUpdateRes.videoUploadCred.public_id);

                    uploadedVideoUrl = await new Promise((resolve, reject) => {
                        const progressElement = document.getElementById("upload-progress");
                        const progressElementText = document.getElementById("upload-progress-text");

                        const xhr = new XMLHttpRequest();

                        xhr.open(
                            "POST",
                            `https://api.cloudinary.com/v1_1/${mediaUpdateRes.videoUploadCred.cloud_name}/${mediaUpdateRes.videoUploadCred.resource_type}/upload`,
                            true
                        );

                        xhr.upload.addEventListener("progress", (e) => {
                            if (progressElement) progressElement.style.display = "flex";
                            if (e.lengthComputable && progressElementText) {
                                const pct = Math.round((e.loaded / e.total) * 100);
                                progressElementText.innerText = `${pct}%`;
                            }
                        });

                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                if (progressElementText) progressElementText.innerText = "Video Uploaded";
                                if (progressElement) progressElement.style.display = "none";
                                try {
                                    const response = JSON.parse(xhr.responseText);
                                    resolve(response?.secure_url || null);
                                } catch (err) {
                                    reject(err);
                                }
                            } else {
                                if (progressElement) progressElement.style.display = "none";
                                reject(new Error(`Upload failed: ${xhr.status}`));
                            }
                        };

                        xhr.onerror = () => {
                            if (progressElement) progressElement.style.display = "none";
                            reject(new Error("Network error during upload"));
                        };

                        xhr.send(videoFormData);
                    });

                    if (!uploadedVideoUrl) {
                        toast.error("Video upload did not return a URL");
                        updateClicked.current = false;
                        closeLoading();
                        return;
                    }
                }



                // 4) Record media URLs (use new ones if uploaded, else keep existing previews)
                const imgURLToSave =
                    image instanceof File ? mediaUpdateRes.imgUploadCred.fileUrl : "";
                const videoURLToSave =
                    video instanceof File ? uploadedVideoUrl : "";

                const recordMedia = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/recordUpdatedMedia`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        movieId: movieIdFromRes,
                        imgURL: imgURLToSave,
                        videoURL: videoURLToSave,
                        token: "68209781nzinw",
                    }),
                });

                const mediaResponse = await recordMedia.json();

                if (!mediaResponse?.ok) {
                    toast.error(mediaResponse?.message || "Failed to record media");
                    updateClicked.current = false;
                    closeLoading();
                    return;
                }
            }


            toast.success("Movie saved successfully");
            closeLoading();
            updateClicked.current = false;

            window.location.reload();
            ;
        } catch (error) {
            updateClicked.current = false;
            closeLoading();
            toast.error(error?.message || "Unexpected error");
        }
    };

    const deleteMovie = async () => {

        let isConfirm = confirm("Do you want to delete the movie ?");

        if (isConfirm) {
            try {
                showLoading();
                let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/deleteMovie`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        movieId,
                        token: "238972dkm890u2"
                    })
                });

                let res = await req.json();

                if (!res.ok) {
                    toast.error(`${res.message}`);
                }

                toast.success(`${res.message}`);
                closeLoading();
                window.location.reload();
                ;
            } catch (error) {
                closeLoading();
                toast.error(error?.message || "Unexpected error");
                return;
            }
        }
    }

    return (
        <div className={styles.addMovieModal}>
            <div className={styles.addmovieContainer}>
                <IoMdCloseCircle
                    size={20}
                    color="white"
                    className={styles.closeBtn}
                    onClick={() => closeWindow?.()}
                />

                <h2 onClick={() => window.location.reload()
                }>Edit Movie</h2>

                <div className={styles.addMovieColumns}>
                    <div className={styles.movieColumn}>
                        <div className={styles.inputDiv}>
                            <p>Title</p>
                            <input
                                placeholder="Movie name here..."
                                value={editMovieData.title || ""}
                                onChange={(e) => setEditMovieData((prev) => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className={styles.inputDiv}>
                            <p>About</p>
                            <input
                                placeholder="About the movie..."
                                value={editMovieData.bio || ""}
                                onChange={(e) => setEditMovieData((prev) => ({ ...prev, bio: e.target.value }))}
                            />
                        </div>

                        <div className={styles.inputDiv}>
                            <p>Genre</p>
                            <select
                                value={Array.isArray(editMovieData.genre) ? editMovieData.genre[0] : ""}
                                onChange={(e) =>
                                    setEditMovieData((prev) => ({
                                        ...prev,
                                        genre: e.target.value ? [e.target.value] : []
                                    }))
                                }
                                className={styles.selectField}
                                style={{ width: "100%" }}
                            >
                                <option value="">Select Genre</option>
                                {genre.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className={styles.inputDiv}>
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 10
                                }}
                            >
                                <p style={{ margin: 0 }}>Image</p>
                                <button
                                    type="button"
                                    style={{
                                        padding: 10,
                                        paddingTop: 5,
                                        paddingBottom: 5,
                                        borderRadius: 8,
                                        border: "none",
                                        outline: "none",
                                        backgroundColor: "rgba(76, 207, 0, 1)",
                                        color: "white",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => fileInputImageRef.current?.click()}
                                >
                                    Upload Image
                                </button>
                            </div>
                            <div
                                style={{
                                    width: "100%",
                                    height: 335,
                                    backgroundColor: "#3b3b3b",
                                    borderRadius: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                <input
                                    id="thumbnailImage"
                                    type="file"
                                    ref={fileInputImageRef}
                                    style={{ display: "none" }}
                                    onChange={handleImageFileChange}
                                    accept="image/jpeg,image/png,image/jpg"
                                />

                                {!imagePreview ? (
                                    <button
                                        type="button"
                                        style={{
                                            padding: 10,
                                            borderRadius: 8,
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "rgba(76, 207, 0, 1)",
                                            color: "white",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => fileInputImageRef.current?.click()}
                                    >
                                        Upload Image
                                    </button>
                                ) : (
                                    <img
                                        src={imagePreview}
                                        alt="Movie thumbnail"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        onClick={() => fileInputImageRef.current?.click()}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.movieColumn}>
                        <div className={styles.inputDiv} style={{ paddingBottom: 10 }}>
                            <p>Languages</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className={styles.languageChips}>
                                    {Array.isArray(editMovieData.language) && editMovieData.language.length > 0 ? (
                                        editMovieData.language.map((lang) => (
                                            <span key={lang} className={styles.chip}>
                                                {lang}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditMovieData((prev) => {
                                                            const current = Array.isArray(prev.language) ? prev.language : [];
                                                            return { ...prev, language: current.filter((l) => l !== lang) };
                                                        })
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ letterSpacing: 1 }}>No languages selected yet</span>
                                    )}
                                </div>

                                <select
                                    value=""
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!value) return;

                                        setEditMovieData((prev) => {
                                            const current = Array.isArray(prev.language) ? prev.language : [];
                                            return {
                                                ...prev,
                                                language: current.includes(value) ? current : [...current, value],
                                            };
                                        });
                                    }}
                                    className={styles.selectField}
                                >
                                    <option value="">Select Language</option>
                                    {language.map((lang) => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputDiv}>
                            <p>Director</p>
                            <input
                                placeholder="Director name..."
                                value={editMovieData.director || ""}
                                onChange={(e) =>
                                    setEditMovieData((prev) => ({ ...prev, director: e.target.value }))
                                }
                            />
                        </div>

                        <div className={styles.doubleInputDiv}>
                            <div className={styles.inputDiv}>
                                <p>Rating</p>
                                <input
                                    type="number"
                                    value={editMovieData.rating ?? ""}
                                    onChange={(e) => setEditMovieData((prev) => ({ ...prev, rating: e.target.value }))}
                                />
                            </div>

                            <div className={styles.inputDiv}>
                                <p>Year</p>
                                <input
                                    type="number"
                                    value={editMovieData.year ?? ""}
                                    onChange={(e) => setEditMovieData((prev) => ({ ...prev, year: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className={styles.inputDiv}>
                            <p>Cast</p>
                            <input
                                placeholder="Type names with commas"
                                value={editMovieData.cast || ""}
                                onChange={(e) => setEditMovieData((prev) => ({ ...prev, cast: e.target.value }))}
                            />
                        </div>

                        <div className={styles.inputDiv}>
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 10
                                }}
                            >
                                <p style={{ margin: 0 }}>Image</p>
                                <button
                                    type="button"
                                    style={{
                                        padding: 10,
                                        paddingTop: 5,
                                        paddingBottom: 5,
                                        borderRadius: 8,
                                        border: "none",
                                        outline: "none",
                                        backgroundColor: "rgba(76, 207, 0, 1)",
                                        color: "white",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => fileInputVideoRef.current?.click()}
                                >
                                    Upload Video
                                </button>
                            </div>
                            <div
                                style={{
                                    width: "100%",
                                    height: 180,
                                    backgroundColor: "#3b3b3b",
                                    borderRadius: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                <input
                                    id="video"
                                    type="file"
                                    ref={fileInputVideoRef}
                                    style={{ display: "none" }}
                                    onChange={handleVideoFileChange}
                                    accept="video/mp4,video/x-matroska,video/webm,video/quicktime,video/x-msvideo"
                                />

                                {!videoPreview ? (
                                    <button
                                        type="button"
                                        style={{
                                            padding: 10,
                                            borderRadius: 8,
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "rgba(76, 207, 0, 1)",
                                            color: "white",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => fileInputVideoRef.current?.click()}
                                    >
                                        Upload Video
                                    </button>
                                ) : (
                                    <video
                                        key={videoPreview}
                                        src={videoPreview}
                                        controls
                                        preload="metadata"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row", justifyContent: "space-between"
                            }}
                        >
                            <button
                                className={styles.movieUploadBtn} type="button"
                                style={{ width: "48%", padding: 12 }}
                                onClick={upload}
                            >
                                <MdAdd size={20} />
                                <span>Update</span>
                            </button>
                            <button
                                className={styles.movieUploadBtn} type="button"
                                style={{ width: "48%", padding: 12, backgroundColor: "red" }}
                                onClick={deleteMovie}
                            >
                                <RiDeleteBin6Line size={20} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function MoviePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [movieList, setMovieList] = useState([]);
    const [showMovieModal, setShowMovieModal] = useState(false);
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [currentMovie, setCurrentMovie] = useState({});
    const [searchData, setSearchData] = useState({
        title: "",
        year: "",
        genre: "",
    });

    const fetchMovieList = async () => {

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}movie/getMovieListAdmin`);

        let res = await req.json();

        if (!res.ok) {
            toast.error("Movies can't be fetch !");
            return;
        }
        setMovieList([...res.data]);
        setIsLoading(false);

    }

    useEffect(() => {
        fetchMovieList();
    }, [])

    const filteredMovies = movieList.filter((movie) => {
        const titleMatch =
            !searchData.title ||
            movie.title
                ?.toLowerCase()
                .includes(searchData.title.toLowerCase());

        const yearMatch =
            !searchData.year ||
            String(movie.year).includes(searchData.year);

        const genreMatch =
            !searchData.genre ||
            movie.genre?.some((g) =>
                g.toLowerCase().includes(searchData.genre.toLowerCase())
            );

        return titleMatch && yearMatch && genreMatch;
    });



    return (
        <div className={styles.page}>
            {isLoading && <SpinnerComp />}
            <AdminSideBar page="movie" />

            <div className={styles.content}>
                {showMovieModal && (
                    <MovieModal
                        movieId={currentMovie.id}
                        closeWindow={() => setShowMovieModal(false)}
                        showLoading={() => setIsLoading(true)}
                        closeLoading={() => setIsLoading(false)}
                    />
                )}

                {
                    showAddMovieModal && <AddMovieModal
                        closeWindow={() => setShowAddMovieModal(false)}
                        showLoading={() => setIsLoading(true)}
                        closeLoading={() => setIsLoading(false)}
                    >

                    </AddMovieModal>
                }

                <div className={styles.header}>
                    <h2 className={styles.title}>Movie Management</h2>
                    <p className={styles.subtitle}>
                        Upload, delete, modify all movies
                    </p>
                </div>

                <div className={styles.searchBox}>
                    <div className={styles.searchGrid}>
                        {["title", "year", "genre"].map((k) => (
                            <input
                                key={k}
                                className={styles.input}
                                placeholder={`Enter ${k}`}
                                value={searchData[k]}
                                onChange={(e) =>
                                    setSearchData({ ...searchData, [k]: e.target.value })
                                }
                            />
                        ))}
                    </div>

                    <div className={styles.buttonRow}>
                        <button className={styles.searchBtn} >
                            <MdSearch size={20} /> Search Movie
                        </button>
                        <button
                            className={styles.resetBtn}
                        >
                            Show All
                        </button>
                    </div>
                </div>

                <div className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                {["Sl", "Title", "Genre", "Year", "Watched", "Up-By"].map((h) => (
                                    <th key={h} className={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovies.map((u, i) => (
                                <tr
                                    key={u._id}
                                    className={styles.tr}
                                    onClick={() => {
                                        setCurrentMovie({
                                            id: u._id,
                                            title: u.title,
                                            genre: u.genre,
                                            year: u.year,
                                            watched: u.watched,
                                            upBy: u.upBy,
                                        });
                                        setShowMovieModal(true);
                                    }}
                                >
                                    <td className={styles.td}>{i + 1}</td>
                                    <td className={`${styles.td} ${styles.blue}`}>
                                        {u.title}
                                    </td>
                                    <td className={`${styles.td} ${styles.white}`}>
                                        {JSON.stringify(u.genre)}
                                    </td>
                                    <td className={styles.td}>{u.year}</td>
                                    <td className={styles.td}>{u.watched}</td>
                                    <td className={styles.td}>{u.upBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!movieList.length && !isLoading && (
                        <div className={styles.empty}>No movie found</div>
                    )}
                </div>

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Total Movies</p>
                        <p className={styles.statValue}>{movieList.length}</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Uploaded Today</p>
                        <p className={`${styles.statValue} ${styles.green}`}>
                            {Math.floor(movieList.length * 0.3)}
                        </p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Uploaded This Week</p>
                        <p className={`${styles.statValue} ${styles.blueStat}`}>
                            {Math.floor(movieList.length * 0.1)}
                        </p>
                    </div>
                </div>

                {!showAddMovieModal && <button className={styles.addBtn} onClick={() => setShowAddMovieModal(true)}>
                    <MdAdd size={20} />
                    <span>Add Movie</span>
                </button>}
                <div id="upload-progress" className={styles.videoLoader}>
                    <p id="upload-progress-text">0%</p>
                </div>
            </div>
        </div >
    )
}

export default MoviePage