# QA extra fixtures — enrich the fixture backend with complex object graphs that the
# in-agent bounded REST seeding cannot express (admin-level configuration, multi-entity
# wiring). Runs ONCE pre-agent, inside the backend container, via:
#   docker compose exec -T backend python manage.py shell < qa-extra-fixtures.py
# Idempotent (looks up before creating), bounded, and best-effort: any failure prints a
# warning and leaves baseline fixtures intact. Output lines are prefixed QA-EXTRA-FIXTURES
# and captured to /tmp/gh-aw/agent/extra-fixtures.log for the agent to read.
#
# Current graphs:
#   1. ENG-503-class: an ActivityDefinition with MULTIPLE diagnostic_report_codes plus an
#      active ServiceRequest wired to it (feature: one diagnostic report per code).

import traceback
import uuid

from django.apps import apps


def log(msg):
    print(f"QA-EXTRA-FIXTURES: {msg}", flush=True)


try:
    ActivityDefinition = apps.get_model("emr", "ActivityDefinition")
    ServiceRequest = apps.get_model("emr", "ServiceRequest")
    Encounter = apps.get_model("emr", "Encounter")

    # care stores facility-scoped slugs fully qualified: f-<facility_uuid>-<value>
    # (SlugBaseModel.calculate_slug / parse_slug). A bare value 500s at retrieval with
    # ValueError("Invalid slug") when serializers parse it back.
    SLUG_VALUE = "qa-multi-diag-panel"
    TITLE = "QA Multi-Code Lab Panel"
    CODES = [
        {
            "system": "http://loinc.org",
            "code": "58410-2",
            "display": "CBC panel - Blood by Automated count",
        },
        {
            "system": "http://loinc.org",
            "code": "57698-3",
            "display": "Lipid panel with direct LDL - Serum or Plasma",
        },
    ]

    encounter = Encounter.objects.select_related("patient", "facility").first()
    if encounter is None:
        log("WARN no encounter in fixtures; skipping ENG-503 graph")
    else:
        facility = encounter.facility
        full_slug = f"f-{facility.external_id}-{SLUG_VALUE}"
        ad = ActivityDefinition.objects.filter(slug=full_slug, facility=facility).first()
        if ad is None:
            template = ActivityDefinition.objects.filter(facility=facility).first()
            if template is None:
                template = ActivityDefinition.objects.first()
            if template is not None:
                # Clone an existing definition so every required/enum field is valid,
                # then overwrite only what this graph is about.
                ad = ActivityDefinition.objects.get(pk=template.pk)
                ad.pk = None
                ad.id = None
                if hasattr(ad, "external_id"):
                    ad.external_id = uuid.uuid4()
                ad.facility = facility
            else:
                ad = ActivityDefinition(
                    facility=facility,
                    version=1,
                    classification="test",
                    status="active",
                    description="QA-seeded multi-code lab panel",
                    usage="QA",
                    kind="service_request",
                )
            ad.slug = full_slug
            ad.title = TITLE
            ad.diagnostic_report_codes = CODES
            # No specimen prerequisite: the frontend enables "Create Report" when
            # specimen_requirements is empty OR a specimen is collected. Empty keeps the
            # QA focus on the multi-code report flow itself, not specimen collection.
            ad.specimen_requirements = []
            ad.latest = True
            ad.save()
            log(f"created ActivityDefinition '{TITLE}' slug={full_slug}")
        else:
            changed = False
            if not ad.diagnostic_report_codes or len(ad.diagnostic_report_codes) < 2:
                ad.diagnostic_report_codes = CODES
                changed = True
            if ad.specimen_requirements:
                ad.specimen_requirements = []
                changed = True
            if changed:
                ad.save(update_fields=["diagnostic_report_codes", "specimen_requirements"])
            log(f"ActivityDefinition slug={full_slug} already present")

        sr = ServiceRequest.objects.filter(
            activity_definition=ad, status="active"
        ).first()
        if sr is None:
            sr = ServiceRequest(
                facility=facility,
                title=TITLE,
                category="laboratory",
                status="active",
                intent="order",
                priority="routine",
                code=(ad.code or CODES[0]),
                patient=encounter.patient,
                encounter=encounter,
                activity_definition=ad,
            )
            sr.save()
            log("created ServiceRequest wired to the multi-code definition")
        else:
            log("ServiceRequest already present")

        log(
            "ENG-503 graph ready: facility="
            + str(getattr(facility, "external_id", facility.pk))
            + " patient="
            + str(getattr(encounter.patient, "external_id", encounter.patient.pk))
            + " encounter="
            + str(getattr(encounter, "external_id", encounter.pk))
            + " service_request="
            + str(getattr(sr, "external_id", sr.pk))
            + " activity_definition="
            + str(getattr(ad, "external_id", ad.pk))
        )
except Exception:
    log("WARN seeding failed (baseline fixtures unaffected)")
    traceback.print_exc()
