import { Category, Helpline } from "../models/index.js";
import { ok, fail, validId } from "./shared.js";

export async function categories(req, res, next) {
  try {
    const filter =
      req.user?.role === "admin" && req.query.all === "true"
        ? {}
        : { isActive: true };
    ok(res, await Category.find(filter).sort("name"));
  } catch (e) {
    next(e);
  }
}
export async function categoryCreate(req, res, next) {
  try {
    ok(res, await Category.create(req.body), "Category created", 201);
  } catch (e) {
    next(e);
  }
}
export async function categoryUpdate(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid category id.");
    const c = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!c) throw fail(404, "Category not found.");
    ok(res, c);
  } catch (e) {
    next(e);
  }
}
export async function categoryDelete(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid category id.");
    const c = await Category.findById(req.params.id);
    if (!c) throw fail(404, "Category not found.");
    if (await Helpline.exists({ category: c._id, isActive: true }))
      throw fail(
        409,
        "Reassign or deactivate active helplines before deleting this category.",
      );
    c.isActive = false;
    await c.save();
    ok(res, c, "Category deactivated");
  } catch (e) {
    next(e);
  }
}
export async function helplines(req, res, next) {
  try {
    const {
      search = "",
      category,
      verified,
      active,
      sort = "name",
      page = 1,
      limit = 12,
    } = req.query;
    const filter = {};
    if (req.user?.role !== "admin" || active !== "all")
      filter.isActive = active === "false" ? false : true;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;
    if (category) {
      if (!validId(category)) throw fail(400, "Invalid category id.");
      filter.category = category;
    }
    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "i");
      filter.$or = [
        { name: re },
        { number: re },
        { purpose: re },
        { operator: re },
        { governmentBody: re },
      ];
    }
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 12)),
      p = Math.max(1, Number(page) || 1);
    const publicFields =
      "name number description purpose operator governmentBody category availability isTollFree eligibility services contactChannels officialWebsite sourceUrl additionalSources lastVerifiedAt isVerified";
    const fields =
      req.user?.role === "admin" ? `${publicFields} isActive` : publicFields;
    const [items, total] = await Promise.all([
      Helpline.find(filter)
        .select(fields)
        .populate("category", "name icon")
        .sort(
          sort === "newest"
            ? "-createdAt"
            : sort === "verified"
              ? "-isVerified name"
              : "name",
        )
        .skip((p - 1) * safeLimit)
        .limit(safeLimit),
      Helpline.countDocuments(filter),
    ]);
    ok(res, { items, total, page: p, pages: Math.ceil(total / safeLimit) });
  } catch (e) {
    next(e);
  }
}
export async function helplineGet(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid helpline id.");
    const h = await Helpline.findById(req.params.id)
      .select(
        req.user?.role === "admin"
          ? "name number description purpose operator governmentBody category availability isTollFree eligibility services contactChannels officialWebsite sourceUrl additionalSources lastVerifiedAt isVerified isActive"
          : "name number description purpose operator governmentBody category availability isTollFree eligibility services contactChannels officialWebsite sourceUrl additionalSources lastVerifiedAt isVerified isActive",
      )
      .populate("category", "name icon");
    if (!h || (!h.isActive && req.user?.role !== "admin"))
      throw fail(404, "Helpline not found.");
    const result = h.toObject();
    if (req.user?.role !== "admin") delete result.isActive;
    ok(res, result);
  } catch (e) {
    next(e);
  }
}
function validateSources(body) {
  for (const key of ["sourceUrl", "officialWebsite"])
    if (body[key] && !/^https?:\/\//i.test(body[key]))
      throw fail(400, `${key} must be a valid HTTP or HTTPS URL.`);
  for (const source of body.additionalSources || [])
    if (source.url && !/^https?:\/\//i.test(source.url))
      throw fail(400, "Additional source links must use HTTP or HTTPS.");
  for (const channel of body.contactChannels || [])
    if (
      channel.url &&
      !/^(https?:\/\/|tel:|mailto:|sms:)/i.test(channel.url)
    )
      throw fail(400, "Contact links must use HTTP, HTTPS, tel, email, or SMS.");
  if (body.isVerified === true && !(body.sourceUrl || body.officialWebsite))
    throw fail(
      400,
      "Add an official source URL before marking this listing verified.",
    );
}
export async function helplineCreate(req, res, next) {
  try {
    validateSources(req.body);
    if (!validId(req.body.category)) throw fail(400, "Choose a valid category.");
    if (!(await Category.exists({ _id: req.body.category, isActive: true })))
      throw fail(400, "Choose an active category.");
    if (req.body.isVerified && !req.body.lastVerifiedAt)
      req.body.lastVerifiedAt = new Date();
    ok(res, await Helpline.create(req.body), "Helpline created", 201);
  } catch (e) {
    next(e);
  }
}
export async function helplineUpdate(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid helpline id.");
    const existing = await Helpline.findById(req.params.id);
    if (!existing) throw fail(404, "Helpline not found.");
    const patch = { ...req.body };
    validateSources({ ...existing.toObject(), ...patch });
    if (
      patch.category &&
      (!validId(patch.category) ||
        !(await Category.exists({ _id: patch.category, isActive: true })))
    )
      throw fail(400, "Choose an active category.");
    if (patch.isVerified === true && !patch.lastVerifiedAt)
      patch.lastVerifiedAt = new Date();
    const h = await Helpline.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    }).populate("category", "name icon");
    ok(res, h);
  } catch (e) {
    next(e);
  }
}
export async function helplineDelete(req, res, next) {
  try {
    if (!validId(req.params.id)) throw fail(400, "Invalid helpline id.");
    const h = await Helpline.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!h) throw fail(404, "Helpline not found.");
    ok(res, h, "Helpline deactivated");
  } catch (e) {
    next(e);
  }
}
