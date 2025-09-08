import React, { useState, createContext, useEffect } from "react";

export const MenuContentContext = createContext();

export const MenuContentProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [menuContent, setMenuContent] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ status: "unknown" });
  const [images, setImages] = useState({});
  const [currentCategory, setCurrentCategory] = useState("");

  // 🔹 Fetch server status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}status`);
        if (!response.ok) throw new Error("Failed to fetch server status");
        const data = await response.json();
        setStatus(data); // expected: {status:"ok"}
      } catch (error) {
        console.error("Error fetching server status:", error);
        setStatus({ status: "offline" });
      }
    };

    fetchStatus();
  }, []);

  // 🔹 Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}menu/categories`);
        const data = await response.json(); // ["maniok.png", "fufu.png", ...]
        const names = data.map((name) => name.replace(/\.[^/.]+$/, "")); // strip extensions
        setMenuCategories(names);

        if (names.length > 0) {
          setCurrentCategory(names[0]); // ✅ default to first category
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setMenuCategories([]);
      }
    };

    if (status.status === "online") {
      fetchCategories();
    }
  }, [status]);

  // 🔹 Fetch menu content when category changes
  useEffect(() => {
    const fetchDefaultMenuContent = async (category) => {
      if (!status || status.status === "offline" || !category) {
        setMenuContent([]);
        setLoading(false);
        return;
      }

      try {
        setMenuContent([]); // ✅ clear stale data before fetching
        const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}menu/${category}`);
        const data = await response.json();
        setMenuContent(data);
      } catch (error) {
        console.error("Error fetching menu content:", error);
        setMenuContent([]);
      } finally {
        setLoading(false);
      }
    };

    if (menuCategories.length > 0) {
      fetchDefaultMenuContent(currentCategory);
    }
  }, [menuCategories, status, currentCategory]);

  // 🔹 Fetch images for menu items
useEffect(() => {
  if (!currentCategory || menuContent.length === 0) return;

  const extensions = [".webp", ".jpg", ".jpeg", ".png", ".svg", ".gif"];
  let newUrls = [];

  const fetchImages = async () => {
    const imagePromises = menuContent.map(async (item) => {
      // Use existing image if already fetched
      if (images[item.id]) return { id: item.id, url: images[item.id] };

      for (const ext of extensions) {
        const url = `${process.env.REACT_APP_PUBLIC_URL}images/${encodeURIComponent(currentCategory)}/${encodeURIComponent(item.id)}${ext}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            newUrls.push(objectUrl);
            return { id: item.id, url: objectUrl };
          }
        } catch (err) {
          // silently ignore fetch errors
        }
      }
      return null;
    });

    const loadedImages = (await Promise.all(imagePromises)).filter(Boolean);

    // Only keep images for current category
    const imageMap = loadedImages.reduce((acc, { id, url }) => {
      acc[id] = url;
      return acc;
    }, {});

    setImages(imageMap); // REPLACE old images entirely
  };

  fetchImages();

  // Clean up blobs when category changes
  return () => newUrls.forEach(URL.revokeObjectURL);
}, [currentCategory, menuContent]);


  return (
    <MenuContentContext.Provider
      value={{
        menuContent,
        loading,
        menuCategories,
        status,
        setSearchValue,
        images,
        setCurrentCategory,
        searchValue,
        currentCategory,
      }}
    >
      {children}
    </MenuContentContext.Provider>
  );
};
