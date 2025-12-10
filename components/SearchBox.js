"use client";
import React, { useState, useRef, useEffect } from "react";

const SearchBox = ({ name, placeholder, data, onSearch }) => {
  const [selected, setSelected] = useState("Tutti");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    onSearch({ search, selected: selected === "Tutti" ? undefined : selected });
  }, [search, selected, onSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      // se il ref esiste e il click NON è dentro il componente
      if (ref.current && !ref.current.contains(event.target)) {
        setShowSearch(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-box">
      <label>{name}</label>

      <div ref={ref}>
        <button
          type="button"
          onClick={() => setShowSearch((prev) => !prev)}
          className={selected === "Tutti" && search ? "selected" : ""}
        >
          {selected} {selected === "Tutti" && search && `(filtro: "${search}")`}
        </button>
        {showSearch && (
          <div className="search-box-search">
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowSearch(false);
              }}
            />
            <ul>
              {["Tutti", ...data].map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelected(item);
                    setSearch("");

                    setShowSearch(false);
                  }}
                  className={selected === item ? "selected" : ""}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
