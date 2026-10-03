"""Pydantic models describing every formatting option the UI can send."""
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

FontFamily = Literal["Times New Roman", "Arial", "Calibri", "Georgia", "Garamond", "Verdana"]
Alignment = Literal["left", "center", "right", "justify"]
ALLOWED_SIZES = {10, 11, 12, 13, 14, 16, 18, 20, 24}
ALLOWED_LINE_SPACING = {1.0, 1.15, 1.5, 2.0}
ALLOWED_INDENTS = {0.0, 0.25, 0.5}


class TitleSettings(BaseModel):
    font_family: FontFamily = "Times New Roman"
    size: float = 20
    bold: bool = True
    alignment: Alignment = "center"


class HeadingSettings(BaseModel):
    font_family: Optional[FontFamily] = None  # None = same as body font
    size: float = 16
    bold: bool = True


class HeaderFooterSettings(BaseModel):
    enabled: bool = False
    text: str = Field(default="", max_length=200)
    alignment: Literal["left", "center", "right"] = "center"


class PageNumberSettings(BaseModel):
    enabled: bool = False
    position: Literal[
        "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
    ] = "bottom-center"


class CustomMargins(BaseModel):
    top: float = Field(default=1.0, ge=0, le=4)
    bottom: float = Field(default=1.0, ge=0, le=4)
    left: float = Field(default=1.0, ge=0, le=4)
    right: float = Field(default=1.0, ge=0, le=4)


class ChapterLabelSettings(BaseModel):
    """Lines such as "1", "II", "UNIT I" or "CHAPTER 2: Basics" that are not Word headings."""
    enabled: bool = True
    alignment: Alignment = "center"


class FormattingSettings(BaseModel):
    template: Optional[str] = None

    font_family: FontFamily = "Times New Roman"
    font_size: float = 12
    font_style: Literal["normal", "bold", "italic", "underline"] = "normal"

    alignment: Alignment = "justify"
    line_spacing: float = 1.5
    space_before: float = Field(default=0, ge=0, le=24)
    space_after: float = Field(default=6, ge=0, le=24)
    first_line_indent: float = 0.0

    page_size: Literal["A4", "Letter", "Legal"] = "A4"
    orientation: Literal["portrait", "landscape"] = "portrait"
    margin_preset: Literal["normal", "narrow", "moderate", "wide", "custom"] = "normal"
    custom_margins: CustomMargins = CustomMargins()

    chapter_labels: ChapterLabelSettings = ChapterLabelSettings()
    keep_centered_lines: bool = True

    title: TitleSettings = TitleSettings()
    heading1: HeadingSettings = HeadingSettings(size=16)
    heading2: HeadingSettings = HeadingSettings(size=14)
    heading3: HeadingSettings = HeadingSettings(size=12)

    normalize_fonts: bool = True
    normalize_font_size: bool = True
    normalize_alignment: bool = True
    normalize_line_spacing: bool = True
    normalize_paragraph_spacing: bool = True
    remove_blank_paragraphs: bool = True
    preserve_images: bool = True
    preserve_tables: bool = True
    preserve_hyperlinks: bool = True

    header: HeaderFooterSettings = HeaderFooterSettings()
    footer: HeaderFooterSettings = HeaderFooterSettings()
    page_numbers: PageNumberSettings = PageNumberSettings()

    @field_validator("font_size")
    @classmethod
    def _size(cls, v: float) -> float:
        if v not in ALLOWED_SIZES:
            raise ValueError("Unsupported font size")
        return v

    @field_validator("line_spacing")
    @classmethod
    def _spacing(cls, v: float) -> float:
        if v not in ALLOWED_LINE_SPACING:
            raise ValueError("Unsupported line spacing")
        return v

    @field_validator("first_line_indent")
    @classmethod
    def _indent(cls, v: float) -> float:
        if v not in ALLOWED_INDENTS:
            raise ValueError("Unsupported indent")
        return v


MARGIN_PRESETS = {  # inches: top, bottom, left, right
    "normal": (1.0, 1.0, 1.0, 1.0),
    "narrow": (0.5, 0.5, 0.5, 0.5),
    "moderate": (1.0, 1.0, 0.75, 0.75),
    "wide": (1.0, 1.0, 2.0, 2.0),
}

PAGE_SIZES_INCHES = {  # width, height in portrait
    "A4": (8.27, 11.69),
    "Letter": (8.5, 11.0),
    "Legal": (8.5, 14.0),
}
