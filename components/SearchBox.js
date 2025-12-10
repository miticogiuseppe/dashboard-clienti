"use client";
import React, { Fragment, useState, useEffect } from "react";

const SearchBox = ({ name, placeholder, data, onSearch }) => {
  const [selected, setSelected] = useState("Tutti");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    onSearch({ search, selected: selected === "Tutti" ? undefined : selected });
  }, [search, selected, onSearch]);

  return (
    <div className="search-box">
      <label>{name}</label>

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
  );
};

export default SearchBox;
